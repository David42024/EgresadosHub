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

    // Verificar si las credenciales están configuradas
    if (!clientID || !clientSecret || !callbackURL) {
      super({} as any); // Llamada dummy para satisfacer la herencia
      this.logger.warn('Google OAuth no configurado - faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_CALLBACK_URL');
      return;
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