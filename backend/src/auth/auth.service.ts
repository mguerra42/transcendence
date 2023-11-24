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
import { SetupDto } from './dto/setup.dto';
import * as fs from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signup(credentials: SignUpDto) {
        if (!credentials.email) {
            throw new HttpException(
                'Email is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (!credentials.password) {
            throw new HttpException(
                'Password is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        credentials.username =
            credentials.email.split('@')[0] +
            '_' +
            Math.floor(Math.random() * 10000);

        const exists = await this.usersService.findByEmailOrUsername(
            credentials.email,
            credentials.username,
        );
        if (exists && exists.email === credentials.email) {
            throw new HttpException(
                'Email is already taken.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (exists && exists.username === credentials.username) {
            throw new HttpException(
                'Username is already taken.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        // Moved to enable2fa
        //const secret = speakeasy.generateSecret({ length: 24 });
        //credentials.secret = secret.base32;
        const user = await this.usersService.create(credentials);

        return user;
    }
    async setup(user: any, username: string, avatar?: Express.Multer.File) {
        console.log('setup username=', username);
        console.log('setup avatar=', avatar);
        if (!username) {
            throw new HttpException(
                'Username is required.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const payload = {
            username,
            isSetup: true,
        };
        if (avatar) {
            payload['avatar'] = this.saveAvatar(user, avatar);
        }

        console.log('payload=', payload, user.id);

        await this.usersService.update(user.id, payload);
        return true;
    }

    saveAvatar(user: any, avatar?: Express.Multer.File) {
        if (avatar) {
            if (avatar.size > 1000000) {
                throw new HttpException(
                    'Avatar is too large.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            if (
                avatar.mimetype !== 'image/png' &&
                avatar.mimetype !== 'image/jpeg'
            ) {
                throw new HttpException(
                    'Avatar must be a PNG or JPEG.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            const avatarPath =
                '/backend/avatars/' +
                user.id +
                (avatar.mimetype == 'image/png' ? '.png' : '.jpg');
            console.log('avatarPath=', avatarPath);
            // write avatar to /backend/avatars/
            fs.writeFileSync(avatarPath, avatar.buffer);
            return avatarPath.replace('/backend', '');
        }
    }

    getUserPayload(user, provider) {
        return {
            id: user.id,
            provider,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            mfaEnabled: user.mfaEnabled,
            isSetup: user.isSetup,
            mfaLevel: 1,
        };
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

    async login(user: any) {
        const payload = this.getUserPayload(user, 'credentials');
        const access_token = await this.jwtService.signAsync(payload);
        return {
            access_token: access_token,
        };
    }

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

    async getUser2FASeed(user: any) {
        const account = await this.usersService.findOne(user.id);
        if (!account.mfaSecret) {
            account.mfaSecret = speakeasy.generateSecret({ length: 24 }).base32;
            console.log(account.mfaSecret);
            await this.usersService.update(user.id, {
                mfaSecret: account.mfaSecret,
            });
        }
        return account.mfaSecret;
    }
    async update(user, data) {
        const account = await this.usersService.findOne(user.id);
        if (!account) {
            throw new HttpException(
                'User not found.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        if (data.email != account.email) {
            const exists = await this.usersService.findByEmail(data.email);
            if (exists) {
                throw new HttpException(
                    'Email is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
        }

        if (data.username != account.username) {
            const exists = await this.usersService.findByUsername(
                data.username,
            );
            if (exists) {
                throw new HttpException(
                    'Username is already taken.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
        }

        // check password
        if (!bcrypt.compareSync(data.password, account.password)) {
            throw new HttpException(
                'Password is incorrect.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        let newPassword = undefined;

        if (data.changePassword == 'true') {
            if (data.newPassword !== data.newPasswordConfirmation) {
                throw new HttpException(
                    'Passwords do not match.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            newPassword = bcrypt.hashSync(data.newPassword, 10);
        }

        let mfaSecret = undefined;
        let mfaEnabled = undefined;
        console.log({ data });

        if (data.mfaEnabled == 'true') {
            console.log('data.mfaCode=', data.mfaCode);
            if (!data.mfaCode) {
                throw new HttpException(
                    '2FA code is required.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            const verified = speakeasy.totp.verify({
                secret: account.mfaSecret,
                encoding: 'base32',
                token: data.mfaCode,
                window: 5,
            });

            if (!verified) {
                throw new HttpException(
                    'Invalid two-factor code.',
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }

            mfaEnabled = true;
        } else if (data.mfaEnabled == 'false') {
            mfaEnabled = false;
            mfaSecret = null;
        }

        let newAvatar = undefined;
        if (typeof data.avatar != 'string') {
            console.log('data.avatar=', typeof data.avatar);
            newAvatar = this.saveAvatar(user, data.avatar);
        }

        const updatedUser = await this.usersService.update(user.id, {
            email: data.email,
            username: data.username,
            password: newPassword,
            avatar: newAvatar,
            mfaSecret,
            mfaEnabled,
        });
    }

    async verify2FA(user, twoFactorCode: string): Promise<any> {
        const account = await this.usersService.findOne(user.id);
        if (!account.mfaSecret) {
            throw new HttpException(
                'User does not have 2FA secret.',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        //const secret = speakeasy.generateSecret({ length: 24 });
        //account.secret = secret.base32;
        //console.log(account.secret);
        const verified = speakeasy.totp.verify({
            secret: account.mfaSecret,
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

    ////TODO : move logic from controller here
    //googleLogin(req) {
    //    if (!req.user) {
    //        return 'No user from google';
    //    }
    //    return req.user;
    //}

    ////BUG FIX :
    ////-Fixed wrong condition in if statements to explicity check if field is empty ('')
    ////-Fixed already-taken check to explicity check for null
    ////-Changed object received by prisma service to allow for empty fields in order to avoid UNIQUE constraint errors when updating unchanged field
    ////NEW LOGIC
    ////-Changed update function in users.service.ts to take any object instead of UpdateDto object, to allow for empty fields
    ////-Changed updateDto object to userToUpdateObject interface to allow for empty fields and dynamic add changed fields only
    //async toggle2FA(userId: number): Promise<number> {
    //    const user = await this.usersService.findOne(userId);

    //    const updatedTwoFa = user.twoFa === 0 ? 1 : 0;
    //    console.log('updatedTwoFa=', updatedTwoFa);

    //    interface userToUpdateObject {
    //        twoFa?: number;
    //    }
    //    const userdata: userToUpdateObject = {};
    //    userdata.twoFa = updatedTwoFa;
    //    const ret: any = await this.usersService.update(userId, userdata);
    //    return updatedTwoFa;
    //}

    //async get2faQrCode(userId: number): Promise<string> {
    //    const user = await this.usersService.findOne(userId);
    //    if (!user.secret) {
    //        throw new Error('User does not have 2FA secret.');
    //    }

    //    const otpAuthUrl = speakeasy.otpauthURL({
    //        secret: user.secret,
    //        label: user.email,
    //        issuer: 'Transcsendence',
    //        encoding: 'base32',
    //    });

    //    try {
    //        const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);
    //        return qrCodeDataURL;
    //    } catch (error) {
    //        throw new Error('Error generating QR code.');
    //    }
    //}

    //async update(id: number, updateDto: any) {
    //    //Interface acts as a type definition for an object that can dynamically add fields
    //    //This is to send prisma an object with only fields that have been changed
    //    interface userToUpdateObject {
    //        email?: string;
    //        password?: string;
    //        username?: string;
    //        avatar?: string;
    //    }
    //    const previousUser = await this.usersService.findOne(id);
    //    const userToUpdate: userToUpdateObject = {};

    //    if (!bcrypt.compareSync(updateDto.password, previousUser.password)) {
    //        throw new HttpException(
    //            'Password is incorrect.',
    //            HttpStatus.UNPROCESSABLE_ENTITY,
    //        );
    //    }

    //    //Update object with non-empty fields
    //    //Previously we had 'if (updateDto.property)' which was always true
    //    if (updateDto.email != '') {
    //        const userExists = await this.usersService.findByEmail(
    //            updateDto.email,
    //        );
    //        if (userExists != null) {
    //            throw new HttpException(
    //                'Email is already taken.',
    //                HttpStatus.UNPROCESSABLE_ENTITY,
    //            );
    //        } else userToUpdate.email = updateDto.email;
    //    }
    //    if (updateDto.username != '') {
    //        const userExists = await this.usersService.findByUsername(
    //            updateDto.username,
    //        );
    //        if (userExists != null) {
    //            throw new HttpException(
    //                'Username is already taken.',
    //                HttpStatus.UNPROCESSABLE_ENTITY,
    //            );
    //        } else userToUpdate.username = updateDto.username;
    //    }
    //    if (
    //        updateDto.newPassword != '' &&
    //        updateDto.newPassword !== updateDto.newPasswordConfirmation
    //    ) {
    //        throw new HttpException(
    //            'Passwords do not match.',
    //            HttpStatus.UNPROCESSABLE_ENTITY,
    //        );
    //    }
    //    if (updateDto.newPassword != '') {
    //        userToUpdate.password = bcrypt.hashSync(updateDto.newPassword, 10);
    //    }

    //    if (updateDto.avatar != '') {
    //        userToUpdate.avatar = updateDto.avatar;
    //    }

    //    //If no fields have been changed, return null
    //    //TODO : Check if functions that use authService.update() will break if null is returned
    //    if (Object.keys(userToUpdate).length === 0) return null;

    //    //Send prisma object with updated fields only
    //    const user = await this.usersService.update(id, userToUpdate);
    //    return user;
    //}
}
