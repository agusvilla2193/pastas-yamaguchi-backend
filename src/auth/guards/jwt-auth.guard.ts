import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
// 'jwt' indica que use la estrategia llamada JwtStrategy (Passport lo deduce)
