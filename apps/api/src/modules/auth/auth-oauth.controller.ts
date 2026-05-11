import {
  Controller, Get, UseGuards, Req, Res, HttpCode, HttpStatus,
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
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Redirige a Google OAuth - Passport maneja la redirección
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const googleUser = req.user as GoogleUser;
    const tokenResponse = await this.authService.loginWithGoogle(googleUser);

    // Setear cookie HttpOnly segura
    res.cookie('access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure:   this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth(): void {
    // Redirige a GitHub OAuth - Passport maneja la redirección
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const githubUser = req.user as GitHubUser;
    const tokenResponse = await this.authService.loginWithGitHub(githubUser);

    // Setear cookie HttpOnly segura
    res.cookie('access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure:   this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true };
  }
}
