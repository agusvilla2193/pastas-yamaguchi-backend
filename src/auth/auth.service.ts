import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

// Definimos la interfaz de lo que devuelve el Login/Register para el Frontend
export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(userObject: CreateUserDto): Promise<AuthResponse> {
        const newUser = await this.usersService.create(userObject);

        const payload = {
            email: newUser.email,
            sub: newUser.id,
            role: newUser.role
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
            }
        };
    }

    // Eliminamos el Promise<any> y usamos el tipo Omit para excluir la password
    async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findOneByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            // Extraemos la password para no devolverla nunca
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

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        };

        return {
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
