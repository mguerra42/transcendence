import {
    Injectable,
    UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { DBService } from 'src/db/db.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signup(credentials: SignUpDto) {
        if (!credentials.email || !credentials.username) {
            throw new HttpException(
                'Email and Username are required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const exists = await this.usersService.findByEmailOrUsername(
            credentials.email,
            credentials.username,
        );
        if (exists) {
            throw new HttpException(
                'Email or Username is already taken.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        // Moved to enable2fa
        //const secret = speakeasy.generateSecret({ length: 24 });
        //credentials.secret = secret.base32;
        const user = await this.usersService.create(credentials);

        return user;
    }

    getUserPayload(user, provider) {
        return {
            id: user.id,
            provider,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            mfaEnabled: user.mfaEnabled,
            mfaLevel: 1,
        };
    }

    async login(user: any) {
        console.log('login user=', user);
        //const isTwoFAEnabled = await this.get2FA(user.id);
        const payload = this.getUserPayload(user, 'credentials');
        const access_token = await this.jwtService.signAsync(payload);
        console.log('access_token=', access_token);
        console.log('payload=', payload);
        return {
            access_token: access_token,
        };
    }

    //TODO : move logic from controller here
    async login42(user: any) {
        if (!user) {
            return false;
        }

        let account = await this.usersService.findByEmail(user.email);

        if (!account) {
            account = await this.signup({
                email: user.email,
                username: user.username,
                password: this.usersService.generateRandomString(24),
            });

            await this.usersService.update(account.id, {
                avatar: user.picture,
            });
        }

        const payload = await this.getUserPayload(account, '42');

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token: access_token,
        };
    }

    async verify2FA(user, twoFactorCode: string): Promise<any> {
        const account = await this.usersService.findOne(user.id);
        if (!account.secret) {
            throw new HttpException(
                'User does not have 2FA secret.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        //const secret = speakeasy.generateSecret({ length: 24 });
        //account.secret = secret.base32;
        //console.log(account.secret);
        const verified = speakeasy.totp.verify({
            secret: account.secret,
            encoding: 'base32',
            token: twoFactorCode,
            window: 5,
        });

        if (!verified) {
            throw new HttpException(
                'Invalid two-factor code.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const payload = await this.getUserPayload(account, user.provider);
        payload.mfaLevel = 2;

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token: access_token,
        };
    }

    //TODO : move logic from controller here
    googleLogin(req) {
        if (!req.user) {
            return 'No user from google';
        }
        return req.user;
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return null;
        }
        return user;
    }

    async validateToken(token: string) {
        return this.jwtService.verify(token);
    }

    //BUG FIX :
    //-Fixed wrong condition in if statements to explicity check if field is empty ('')
    //-Fixed already-taken check to explicity check for null
    //-Changed object received by prisma service to allow for empty fields in order to avoid UNIQUE constraint errors when updating unchanged field
    //NEW LOGIC
    //-Changed update function in users.service.ts to take any object instead of UpdateDto object, to allow for empty fields
    //-Changed updateDto object to userToUpdateObject interface to allow for empty fields and dynamic add changed fields only
    async toggle2FA(userId: number): Promise<number> {
        const user = await this.usersService.findOne(userId);

        const updatedTwoFa = user.twoFa === 0 ? 1 : 0;
        console.log('updatedTwoFa=', updatedTwoFa);

        interface userToUpdateObject {
            twoFa?: number;
        }
        const userdata: userToUpdateObject = {};
        userdata.twoFa = updatedTwoFa;
        const ret: any = await this.usersService.update(userId, userdata);
        return updatedTwoFa;
    }

    async get2faQrCode(userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);
        if (!user.secret) {
            throw new Error('User does not have 2FA secret.');
        }

        const otpAuthUrl = speakeasy.otpauthURL({
            secret: user.secret,
            label: user.email,
            issuer: 'Transcsendence',
            encoding: 'base32',
        });

        try {
            const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);
            return qrCodeDataURL;
        } catch (error) {
            throw new Error('Error generating QR code.');
        }
    }

    async update(id: number, updateDto: any) {
        //Interface acts as a type definition for an object that can dynamically add fields
        //This is to send prisma an object with only fields that have been changed
        interface userToUpdateObject {
            email?: string;
            password?: string;
            username?: string;
            avatar?: string;
        }
        const previousUser = await this.usersService.findOne(id);
        const userToUpdate: userToUpdateObject = {};

        if (!bcrypt.compareSync(updateDto.password, previousUser.password)) {
            throw new HttpException(
                'Password is incorrect.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        //Update object with non-empty fields
        //Previously we had 'if (updateDto.property)' which was always true
        if (updateDto.email != '') {
            const userExists = await this.usersService.findByEmail(
                updateDto.email,
            );
            if (userExists != null) {
                throw new HttpException(
                    'Email is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            } else userToUpdate.email = updateDto.email;
        }
        if (updateDto.username != '') {
            const userExists = await this.usersService.findByUsername(
                updateDto.username,
            );
            if (userExists != null) {
                throw new HttpException(
                    'Username is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            } else userToUpdate.username = updateDto.username;
        }
        if (
            updateDto.newPassword != '' &&
            updateDto.newPassword !== updateDto.newPasswordConfirmation
        ) {
            throw new HttpException(
                'Passwords do not match.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (updateDto.newPassword != '') {
            userToUpdate.password = bcrypt.hashSync(updateDto.newPassword, 10);
        }

        if (updateDto.avatar != '') {
            userToUpdate.avatar = updateDto.avatar;
        }

        //If no fields have been changed, return null
        //TODO : Check if functions that use authService.update() will break if null is returned
        if (Object.keys(userToUpdate).length === 0) return null;

        //Send prisma object with updated fields only
        const user = await this.usersService.update(id, userToUpdate);
        return user;
    }
}
