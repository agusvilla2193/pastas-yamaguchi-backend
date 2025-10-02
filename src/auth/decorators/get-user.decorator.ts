import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        // Cuando el JwtAuthGuard valida el token, adjunta la información
        // del usuario (el payload) al objeto 'request.user'.
        const user = request.user;

        // 'data' es el argumento que paso al decorador (ej: @GetUser('userId'))
        // Si paso 'userId', devuelve solo request.user.userId.
        // Si no paso nada (@GetUser()), devuelve el objeto completo del usuario.
        return data ? user?.[data] : user;
    },
);
