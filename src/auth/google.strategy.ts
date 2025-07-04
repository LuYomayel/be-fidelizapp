import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleOAuthConstants } from './constants';
import { AuthService } from './auth.service';

interface GoogleProfile {
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: googleOAuthConstants.clientId,
      clientSecret: googleOAuthConstants.clientSecret,
      callbackURL: googleOAuthConstants.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): void {
    const { name, emails, photos } = profile;
    const user: GoogleUser = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };

    try {
      // Aquí puedes agregar lógica para guardar o buscar el usuario en tu base de datos
      const validatedUser = this.authService.validateGoogleUser(user);
      done(null, validatedUser);
    } catch (error) {
      done(error, false);
    }
  }
}
