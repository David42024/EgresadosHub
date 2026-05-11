import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubStrategy.name);

  constructor(private readonly config: ConfigService) {
    const clientID = config.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = config.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = config.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('GitHub OAuth no configurado - faltan variables de entorno');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });

    this.logger.log('GitHubStrategy inicializada');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    this.logger.log(`GitHub OAuth validate - profile ID: ${profile?.id}`);

    try {
      const { id, username, emails, photos, displayName } = profile;
      
      // GitHub no siempre devuelve email público, buscamos en emails
      const email = emails?.find((e: any) => e.primary)?.value || 
                    emails?.[0]?.value || 
                    `${username}@github.com`;

      const user = {
        provider: 'github',
        providerId: id,
        email,
        name: displayName || username,
        avatarUrl: photos?.[0]?.value,
        accessToken,
      };

      this.logger.log(`GitHub OAuth user: ${user.email}`);
      done(null, user);
    } catch (err) {
      this.logger.error('Error en GitHub OAuth:', err);
      done(new UnauthorizedException('GitHub authentication failed'), false);
    }
  }
}
