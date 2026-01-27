import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { UserSession } from '../interfaces/user-payload.interface';

export const GetUser = createParamDecorator(
    (data: keyof UserSession | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as UserSession;

        if (!user) {
            throw new InternalServerErrorException('User not found in request. Check if JwtAuthGuard is applied.');
        }

        // Ahora TS sabe que 'id', 'email' o 'role' son llaves válidas
        return data ? user[data] : user;
    },
);
