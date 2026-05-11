// ═══════════════════════════════════════════════════════════════
// auth.module.ts
// ═══════════════════════════════════════════════════════════════
import { Module, Logger }          from '@nestjs/common';
import { JwtModule }       from '@nestjs/jwt';
import { PassportModule }  from '@nestjs/passport';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { ConfigService }   from '@nestjs/config';
import { AuthService }     from './auth.service';
import { AuthController }  from './auth.controller';
import { User }            from './entities/user.entity';
import { JwtStrategy }     from './strategies/jwt.strategy';
import { GoogleStrategy }  from './strategies/google.strategy';
import { GitHubStrategy }  from './strategies/github.strategy';
import { AuthRouter }      from './auth.router';
import { EgresadosModule } from '../egresados/egresados.module';
import { EmpresasModule }  from '../empresas/empresas.module';

// Factory para GoogleStrategy - solo se crea si hay credenciales configuradas
const googleStrategyProvider = {
  provide: GoogleStrategy,
  useFactory: (config: ConfigService) => {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      Logger.warn('Google OAuth no configurado - se omite GoogleStrategy', 'AuthModule');
      return null;
    }

    return new GoogleStrategy(config);
  },
  inject: [ConfigService],
};

// Factory para GitHubStrategy - solo se crea si hay credenciales configuradas
const githubStrategyProvider = {
  provide: GitHubStrategy,
  useFactory: (config: ConfigService) => {
    const clientID = config.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = config.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = config.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      Logger.warn('GitHub OAuth no configurado - se omite GitHubStrategy', 'AuthModule');
      return null;
    }

    return new GitHubStrategy(config);
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EgresadosModule,
    EmpresasModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy, googleStrategyProvider, githubStrategyProvider, AuthRouter],
  exports:     [AuthService, JwtModule, AuthRouter],
})
export class AuthModule {}