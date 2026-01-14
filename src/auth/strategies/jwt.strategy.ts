import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        super({
            // 1. Especifica dónde buscar el JWT (en el header 'Authorization: Bearer <token>')
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 2. Si es true, Passport no verifica la expiración del token (siempre false en producción!)
            ignoreExpiration: false,
            // 3. Clave secreta para desencriptar y verificar la firma del token
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    // Este método se llama si el token es válido y no expiró
    async validate(payload: any) {
        // Aca podrías buscar el usuario en la DB para asegurarte de que sigue activo
        // Por ahora, solo devolvemos el ID, email y rol del usuario, que viene en el token
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}
