// ═══════════════════════════════════════════════════════════════
// auth.module.ts
// ═══════════════════════════════════════════════════════════════
import { Module }          from '@nestjs/common';
import { JwtModule }       from '@nestjs/jwt';
import { PassportModule }  from '@nestjs/passport';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { ConfigService }   from '@nestjs/config';
import { AuthService }     from './auth.service';
import { AuthController }  from './auth.controller';
import { User }            from './entities/user.entity';
import { JwtStrategy }     from './strategies/jwt.strategy';
import { GoogleStrategy }  from './strategies/google.strategy';
import { AuthRouter }      from './auth.router';
import { EgresadosModule } from '../egresados/egresados.module';
import { EmpresasModule }  from '../empresas/empresas.module';

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
  providers:   [AuthService, JwtStrategy, GoogleStrategy, AuthRouter],
  exports:     [AuthService, JwtModule, AuthRouter],
})
export class AuthModule {}