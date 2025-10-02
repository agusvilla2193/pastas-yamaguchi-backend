import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            // Si el email existe y la contraseña es correcta
            // Devolvemos el usuario sin la contraseña (¡seguridad!)
            const { password, ...result } = user;
            return result;
        }
        // Si la contraseña o el email no coinciden
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // El "payload" es la información que guardamos dentro del token
        const payload = {
            email: user.email,
            sub: user.id, // 'sub' es un estándar para el ID de usuario
            role: user.role
        };

        return {
            // Devolvemos el token que el frontend usará para hacer peticiones protegidas
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            }
        };
    }
}
