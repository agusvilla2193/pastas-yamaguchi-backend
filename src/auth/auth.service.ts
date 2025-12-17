import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(userObject: CreateUserDto) {
        // 1. Verificamos si el usuario ya existe
        const existingUser = await this.usersService.findOneByEmail(userObject.email);
        if (existingUser) {
            // Si el email ya está en uso, lanzamos una excepción 409 Conflict
            throw new ConflictException('El correo electrónico ya está registrado');
        }

        // 2. Creamos el hash de la contraseña (¡SEGURIDAD!)
        const hashedPassword = await bcrypt.hash(userObject.password, 10);

        // 3. Delegamos la creación al UsersService
        const newUser = await this.usersService.create({
            email: userObject.email,
            password: hashedPassword,
            firstName: userObject.firstName,
            lastName: userObject.lastName,

        });

        // 4. Generamos el token de login inmediatamente (opcional)
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
            // No devolvemos la contraseña ni el hash
        };
    }

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
            sub: user.id,
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
