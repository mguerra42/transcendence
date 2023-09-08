import {
    Controller,
    Post,
    Request,
    Get,
    Body,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleStrategy } from './google.strategy';
import { AuthGuard } from '@nestjs/passport';
import { async } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    @Post('signup')
    async signup(@Body() signupDto: SignUpDto) {
        return await this.authService.signup(signupDto);
    }

    @UseGuards(LocalAuthGuard) // Will use email/pass to retrieve user (look at LocalStrategy) or throw if not valid/found
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.login(req.user); // req.user is the user returned from LocalStrategy.validate()
        res.cookie('access_token', data.access_token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.send(data);
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res: Response) {
        const   googleUser = this.authService.googleLogin(req);
        let     registeredUser = await this.usersService.findByEmail(googleUser.email);
        
        //TODO : Check case where user is already registered but not with google
        if (!registeredUser) {
            const signupDto: SignUpDto = {
                email: googleUser.email,
                username: googleUser.firstName + googleUser.lastName,
                password: this.usersService.generateRandomHex(24),
            };
            registeredUser = await this.authService.signup(signupDto);
        }
    
        //Login upon successful google Auth
        const loginResponse = await this.authService.login(registeredUser);
        res.cookie('access_token', loginResponse.access_token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.redirect('http://localhost:3000');
    }
    

    @UseGuards(JwtAuthGuard)
    @Get('session')
    async session(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
    }
}
