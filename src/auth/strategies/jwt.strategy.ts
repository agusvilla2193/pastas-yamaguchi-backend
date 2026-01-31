import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../interfaces/user-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');

        super({
            // Modificamos la extracción para que busque en las cookies
            jwtFromRequest: (req: Request) => {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies['access_token'];
                }
                return token;
            },
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * Este método se ejecuta tras validar la firma del token.
     */
    async validate(payload: any): Promise<UserSession> {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}
