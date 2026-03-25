import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../interfaces/user-payload.interface';
import { Request } from 'express';

interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');

        super({
            jwtFromRequest: (req: Request) => {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies['access_token'];
                }
                return token;
            },
            ignoreExpiration: false,
            secretOrKey: secret || 'secret_key_fallback',
        });
    }

    async validate(payload: JwtPayload): Promise<UserSession> {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}
