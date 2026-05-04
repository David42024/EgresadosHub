import {
  CanActivate, ExecutionContext, Injectable,
  ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role }      from '@repo/trpc-contract';

export const ROLES_KEY  = 'roles';
export const IS_PUBLIC  = 'isPublic';

export const RequireRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const Public       = ()                 => SetMetadata(IS_PUBLIC, true);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No autenticado');
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Se requiere uno de los roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}

/** Decorador compuesto para endpoints de admin */
export const AdminOnly = () => RequireRoles(Role.ADMINISTRADOR);

/** Para endpoints de empresa o admin */
export const EmpresaOrAdmin = () =>
  RequireRoles(Role.EMPRESA, Role.ADMINISTRADOR);