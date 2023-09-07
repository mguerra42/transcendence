import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { access } from 'fs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID:
                '535545866334-6m8ojtpijkplvoq3l03prmsrei1l0qci.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3001/api/v0/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        console.log('user', user);
        done(null, user);
    }
}
