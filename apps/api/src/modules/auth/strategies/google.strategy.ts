import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile }  from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

    // Debug logging
    const logger = new Logger('GoogleStrategy');
    logger.log(`GOOGLE_CLIENT_ID exists: ${!!clientID}`);
    logger.log(`GOOGLE_CLIENT_SECRET exists: ${!!clientSecret}`);
    logger.log(`GOOGLE_CALLBACK_URL: ${callbackURL}`);

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth no configurado - faltan variables de entorno');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken:  string,
    _refreshToken: string,
    profile:       Profile,
  ) {
    this.logger.log(`Google OAuth validate - profile ID: ${profile?.id}`);

    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('No se pudo obtener el email de Google');

    this.logger.log(`Google OAuth user: ${email}`);

    return {
      googleId:  profile.id,
      email,
      nombre:    profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}