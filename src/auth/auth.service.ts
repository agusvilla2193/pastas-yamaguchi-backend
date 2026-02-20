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
        // 1. Verificamos si el usuario ya existe antes de crearlo
        const userExists = await this.usersService.findOneByEmail(userObject.email);
        if (userExists) {
            throw new ConflictException('El correo electrónico ya está registrado.');
        }

        // 2. Creamos el usuario en la base de datos
        const newUser = await this.usersService.create(userObject);

        // 3. DISPARAR MAIL DE CONFIRMACIÓN (sin await para no bloquear)
        this.mailService.sendConfirmationEmail(
            newUser.email,
            newUser.firstName,
            newUser.confirmationToken
        ).catch(err => console.error('Error enviando mail de bienvenida:', err));

        // 4. Genero el token de acceso para el login automático inicial
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

        // Por seguridad, no revelamos si el mail existe o no
        if (!user) {
            return { message: 'Si el email está registrado, recibirás un enlace de recuperación.' };
        }

        const token = crypto.randomBytes(16).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        await this.usersService.updateResetToken(user.id, token, expires);

        this.mailService.sendResetPasswordEmail(user.email, user.firstName, token)
            .catch(err => console.error('Error enviando reset mail:', err));

        return { message: 'Si el email está registrado, recibirás un enlace de recuperación.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, newPassword } = resetPasswordDto;

        const user = await this.usersService.findByResetToken(token);

        if (!user) {
            throw new BadRequestException('El enlace de recuperación es inválido.');
        }

        const now = new Date();
        if (user.resetPasswordExpires && now > user.resetPasswordExpires) {
            throw new BadRequestException('El enlace de recuperación ha expirado.');
        }

        // El UsersService.update debería encargarse del hasheo si se pasa el campo password
        await this.usersService.update(user.id, { password: newPassword });
        await this.usersService.clearResetToken(user.id);

        return { message: 'Contraseña actualizada con éxito.' };
    }
}
