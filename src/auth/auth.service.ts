import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from './mail.service';

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        phone?: string;
        address?: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(userObject: CreateUserDto): Promise<AuthResponse> {
        // 1. Primero creamos el usuario en la base de datos
        const newUser = await this.usersService.create(userObject);

        // 2. DISPARAR MAIL DE CONFIRMACIÓN
        // Lo hago sin 'await' para que el registro sea instantáneo en el frontend
        this.mailService.sendConfirmationEmail(
            newUser.email,
            newUser.firstName,
            newUser.confirmationToken
        ).catch(err => console.error('Error enviando mail de bienvenida:', err));

        // 3. Genero el token de acceso para que ya quede "logueado" (aunque esté inactivo)
        const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                phone: newUser.phone,
                address: newUser.address
            }
        };
    }

    async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findOneByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            // VERIFICACIÓN DE SEGURIDAD:
            if (!user.isActive) {
                throw new BadRequestException('Debes confirmar tu email antes de iniciar sesión.');
            }

            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const payload = { email: user.email, sub: user.id, role: user.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        };
    }
}
