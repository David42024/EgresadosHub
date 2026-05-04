import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@repo/trpc-contract';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  const mockUserRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const mockJwtService = {
    sign: vi.fn(),
  };
  const mockConfigService = {
    get: vi.fn(),
  };
  const mockDataSource = {
    transaction: vi.fn(),
  };

  beforeEach(() => {
    service = new AuthService(
      mockUserRepo as any,
      mockJwtService as any,
      mockConfigService as any,
      mockDataSource as any,
    );
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      nombres: 'John',
      apellidos: 'Doe',
      role: Role.EGRESADO,
    };

    it('should register a new user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      
      const savedUser = { ...registerDto, id: 'u1' };
      mockDataSource.transaction.mockImplementation(async (cb) => {
        const mockManager = {
          create: vi.fn().mockImplementation((entity, data) => data),
          save: vi.fn().mockImplementation((data) => ({ ...data, id: 'u1' })),
        };
        return cb(mockManager);
      });

      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 12);
      const user = {
        id: 'u1',
        email: loginDto.email,
        passwordHash: hashedPassword,
        role: Role.EGRESADO,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.id).toBe(user.id);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for user without password (Google auth)', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: loginDto.email,
        passwordHash: null,
        isActive: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: loginDto.email,
        passwordHash: await bcrypt.hash('wrong-password', 12),
        isActive: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if found and active', async () => {
      const user = { id: 'u1', email: 'test@example.com', isActive: true };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.validateUser('u1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUser('u1')).rejects.toThrow(NotFoundException);
    });
  });
});
