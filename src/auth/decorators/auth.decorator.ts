import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorador compuesto que aplica:
 * 1. JwtAuthGuard (Autenticación)
 * 2. RolesGuard (Autorización)
 * 3. Metadatos de Roles
 */
export function Auth(...roles: string[]) {
    return applyDecorators(
        Roles(...roles),
        UseGuards(JwtAuthGuard, RolesGuard),
    );
}
