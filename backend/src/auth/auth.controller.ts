import {
    Controller,
    Post,
    Request,
    Get,
    Body,
    Res,
    UseGuards,
    UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateDto } from './dto/update.dto';
import { Express } from 'express';
import * as fs from 'fs';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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

    @UseGuards(JwtAuthGuard)
    @Post('update')
    async update(
        @Request() req,
        @Body() updateDto: UpdateDto,
        @UploadedFile() avatar: Express.Multer.File,
    ) {
        console.log(avatar);
        fs.writeFileSync(`./avatar/${req.user.id}.png`, avatar.buffer);
        return await this.authService.update(req.user.id, updateDto);
    }
}
