import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from './mail.service';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MoreThan } from 'typeorm';

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

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);

        // Por seguridad, aunque el mail no exista, decimos que "se envió" 
        // para no dar pistas de qué emails están registrados
        if (!user) {
            return { message: 'Si el email está registrado, recibirás un enlace de recuperación.' };
        }

        // Generamos un token aleatorio de 32 caracteres
        const token = crypto.randomBytes(16).toString('hex');

        // El token expira en 1 hora
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        // Guardamos en el usuario (necesitarás crear este método en UsersService o actualizarlo aquí)
        await this.usersService.updateResetToken(user.id, token, expires);

        // Enviamos el mail (usando el MailService que ya tenemos)
        this.mailService.sendResetPasswordEmail(user.email, user.firstName, token)
            .catch(err => console.error('Error enviando reset mail:', err));

        return { message: 'Si el email está registrado, recibirás un enlace de recuperación.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword } = resetPasswordDto;

        // 1. Buscar al usuario con ese token
        const user = await this.usersService.findByResetToken(token);

        if (!user) {
            throw new BadRequestException('El enlace de recuperación es inválido.');
        }

        // 2. Verificar si el token expiró
        const now = new Date();
        if (user.resetPasswordExpires && now > user.resetPasswordExpires) {
            throw new BadRequestException('El enlace de recuperación ha expirado.');
        }

        // 3. Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Actualizar usuario y limpiar tokens
        // Usamos el update del usersService que ya maneja el hash si pasamos password
        await this.usersService.update(user.id, { password: newPassword });
        await this.usersService.clearResetToken(user.id);

        return { message: 'Contraseña actualizada con éxito.' };
    }
}
