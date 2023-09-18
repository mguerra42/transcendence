import {
    Controller,
    Post,
    Request,
    Get,
    Body,
    Res,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateDto } from './dto/update.dto';
import { Express } from 'express';
import * as fs from 'fs';
import { GoogleStrategy } from './google.strategy';
import { FortyTwoStrategy } from './intra42.strategy';
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

    //TODO : move to services
    //Google login
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res: Response) {
        const   googleUser = this.authService.googleLogin(req);
        let     registeredUser = await this.usersService.findByEmail(googleUser.email);
        
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

    //42 Login
    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    async Auth42Redirect(@Request() req, @Res({ passthrough: true }) res: Response) {
        const   googleUser = this.authService.login42(req);
        let     registeredUser = await this.usersService.findByEmail(googleUser.email);
        
        if (!registeredUser) {
            const signupDto: SignUpDto = {
                email: googleUser.email,
                username: googleUser.username,
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
        const user = await this.usersService.findOne(req.user.id);
        if (user.username !== null) req.user.username = user.username;
        req.user.avatarPath = user.avatarPath;
        console.log(req.user);
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Request() req,
        @Body() updateDto: UpdateDto,
        @UploadedFile() avatar: Express.Multer.File,
        @Res({ passthrough: true }) res: Response,
    ) {
        if (avatar) {
            fs.writeFileSync(`./avatar/${req.user.id}.jpg`, avatar.buffer);
            updateDto.avatarPath = `./avatar/${req.user.id}.jpg`;
        } else {
            updateDto.avatarPath = '';
        }
        //console.log(avatar, updateDto);
        const newUser = await this.authService.update(req.user.id, updateDto);
        //return await this.authService.update(req.user.id, updateDto);
 
        const loginResponse = await this.authService.login(newUser);
        res.cookie('access_token', loginResponse.access_token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return newUser;
    }
    //TODO : connect to frontend
    @UseGuards(AuthGuard('google'))
    @Post('google/logout')
    async googleLogout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('accessToken');
        return { message: 'Logged out from Google' };
    }

    @UseGuards(AuthGuard('42'))
    @Post('42/logout')
    async fortyTwoLogout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('accessToken');
        return { message: 'Logged out from 42' };
    }
}
