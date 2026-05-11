import {
  Controller, Get, UseGuards, Req, Res, HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

interface GoogleUser {
  googleId:  string;
  email:     string;
  nombre:    string;
  avatarUrl?: string;
}

interface GitHubUser {
  providerId: string;
  email:        string;
  name:         string;
  avatarUrl?:   string;
  accessToken:  string;
}

/**
 * Controlador OAuth sin prefijo API
 * Para permitir rutas como /api/auth/google sin el prefijo /v1
 */
@Controller('api/auth')
export class AuthOAuthController {
  private readonly logger = new Logger(AuthOAuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    this.logger.log(`FRONTEND_URL configurado: ${this.config.get('FRONTEND_URL')}`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    this.logger.log('[GET /google] Redirigiendo a Google OAuth...');
    // Passport maneja la redirección
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log('[GET /google/callback] Callback recibido de Google');
    const googleUser = req.user as GoogleUser;
    this.logger.log(`[Google Callback] Usuario: ${googleUser.email}`);
    
    const tokenResponse = await this.authService.loginWithGoogle(googleUser);
    this.logger.log(`[Google Callback] Token generado para: ${googleUser.email}`);

    // Setear cookie HttpOnly segura
    res.cookie('access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure:   this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    this.logger.log(`[Google Callback] Redirigiendo a: ${frontendUrl}/dashboard`);
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth(): void {
    this.logger.log('[GET /github] Redirigiendo a GitHub OAuth...');
    // Passport maneja la redirección
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log('[GET /github/callback] Callback recibido de GitHub');
    const githubUser = req.user as GitHubUser;
    this.logger.log(`[GitHub Callback] Usuario: ${githubUser.email}`);
    
    const tokenResponse = await this.authService.loginWithGitHub(githubUser);
    this.logger.log(`[GitHub Callback] Token generado para: ${githubUser.email}`);

    // Setear cookie HttpOnly segura
    res.cookie('access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure:   this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    this.logger.log(`[GitHub Callback] Redirigiendo a: ${frontendUrl}/dashboard`);
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true };
  }
}
