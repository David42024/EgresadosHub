import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService }       from '@nestjs/jwt';
import { ConfigService }    from '@nestjs/config';
import * as bcrypt          from 'bcryptjs';
import { User }             from './entities/user.entity';
import { Egresado }         from '../egresados/entities/egresado.entity';
import { Empresa }          from '../empresas/entities/empresa.entity';
import {
  LoginDto, RegisterDto, TokenResponse, Role,
} from '@repo/trpc-contract';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService:    JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource:    DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists !== null) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const defaultAvatar = 'https://res.cloudinary.com/dra8rje99/image/upload/v1777703567/default.png';

    const user = await this.dataSource.transaction(async manager => {
      // 1. Crear el Usuario
      const newUser = manager.create(User, {
        email:        dto.email,
        passwordHash,
        role:         dto.role ?? Role.EGRESADO,
        avatarUrl:    defaultAvatar,
      });
      const savedUser = await manager.save(newUser);

      // 2. Crear el Perfil correspondiente
      if (savedUser.role === Role.EGRESADO) {
        const egresado = manager.create(Egresado, {
          userId:    savedUser.id,
          nombres:   dto.nombres,
          apellidos: dto.apellidos,
          carrera:   '', // Valor por defecto para cumplir con la restricción NOT NULL
          anioEgreso: new Date().getFullYear(),
          fotoUrl:   defaultAvatar,
        });
        await manager.save(egresado);
      } else if (savedUser.role === Role.EMPRESA) {
        const empresa = manager.create(Empresa, {
          userId:      savedUser.id,
          razonSocial: dto.nombres, // Usamos nombres como razón social inicial
          sector:      'Pendiente',
          ubicacion:   'Pendiente',
          logoUrl:     defaultAvatar,
        });
        await manager.save(empresa);
      }

      return savedUser;
    });

    return this.buildTokenResponse(user, `${dto.nombres} ${dto.apellidos}`);
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.userRepo.findOne({
      where:  { email: dto.email, isActive: true },
      select: ['id', 'email', 'role', 'isActive', 'passwordHash'],
    });

    if (user === null) throw new UnauthorizedException('Credenciales incorrectas');
    if (user.passwordHash === null || user.passwordHash === undefined) {
      throw new BadRequestException('Esta cuenta usa inicio de sesión con Google');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.buildTokenResponse(user, user.email);
  }

  async loginWithGoogle(googleUser: {
    googleId: string;
    email: string;
    nombre: string;
    avatarUrl?: string;
  }): Promise<TokenResponse> {
    let user = await this.userRepo.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (user === null) {
      // Buscar si ya existe por email
      user = await this.userRepo.findOne({ where: { email: googleUser.email } });
      if (user !== null) {
        user.googleId  = googleUser.googleId;
        user.avatarUrl = googleUser.avatarUrl;
        await this.userRepo.save(user);
      } else {
        user = await this.userRepo.save(this.userRepo.create({
          email:     googleUser.email,
          googleId:  googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
          role:      Role.EGRESADO,
        }));
      }
    }

    return this.buildTokenResponse(user, googleUser.nombre);
  }

  async loginWithGitHub(githubUser: {
    providerId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<TokenResponse> {
    let user = await this.userRepo.findOne({
      where: { githubId: githubUser.providerId },
    });

    if (user === null) {
      // Buscar si ya existe por email
      user = await this.userRepo.findOne({ where: { email: githubUser.email } });
      if (user !== null) {
        // Actualizar con GitHub ID
        user.githubId = githubUser.providerId;
        if (githubUser.avatarUrl) {
          user.avatarUrl = githubUser.avatarUrl;
        }
        await this.userRepo.save(user);
      } else {
        // Crear nuevo usuario
        user = await this.userRepo.save(this.userRepo.create({
          email: githubUser.email,
          githubId: githubUser.providerId,
          avatarUrl: githubUser.avatarUrl,
          role: Role.EGRESADO,
        }));
      }
    }

    return this.buildTokenResponse(user, githubUser.name);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
    });
    if (user === null) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.validateUser(userId);
    const accessToken = this.signToken(user);
    return { accessToken };
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub:   user.id,
      email: user.email,
      role:  user.role,
    });
  }

  private buildTokenResponse(user: User, nombre: string): TokenResponse {
    return {
      accessToken: this.signToken(user),
      user: {
        id:     user.id,
        email:  user.email,
        role:   user.role,
        nombre,
      },
    };
  }
}