import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../interfaces/user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        // Obtenemos el secreto del configService de forma segura
        const secret = configService.get<string>('JWT_SECRET');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * Este método se ejecuta tras validar la firma del token.
     * El 'payload' es el contenido decodificado del JWT.
     */
    async validate(payload: any): Promise<UserSession> {
        // Tipamos el retorno para asegurar que el objeto 'request.user'
        // sea exactamente lo que espera nuestro decorador GetUser.
        return {
            id: payload.sub, // 'sub' es el estándar de JWT para el ID del sujeto
            email: payload.email,
            role: payload.role
        };
    }
}
