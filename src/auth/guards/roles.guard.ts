import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Obtenemos los roles requeridos desde el decorador @Roles
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. Si la ruta no tiene el decorador @Roles, permitimos el acceso (asumiendo que ya pasó por el JwtAuthGuard)
        if (!requiredRoles) {
            return true;
        }

        // 3. Obtenemos al usuario desde la petición (inyectado por Passport/JWT)
        const { user } = context.switchToHttp().getRequest();

        // 4. Verificamos si el rol del usuario coincide con los permitidos
        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
        }

        return true;
    }
}
