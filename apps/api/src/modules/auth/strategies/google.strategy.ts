import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile }  from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID:     config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL:  config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken:  string,
    _refreshToken: string,
    profile:       Profile,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('No se pudo obtener el email de Google');

    return {
      googleId:  profile.id,
      email,
      nombre:    profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}