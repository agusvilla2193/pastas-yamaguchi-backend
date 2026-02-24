import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from './mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(createUserDto: CreateUserDto) {
        const userExists = await this.usersService.findOneByEmail(createUserDto.email);
        if (userExists) throw new ConflictException('El correo ya está registrado.');

        const newUser = await this.usersService.create(createUserDto);

        this.mailService.sendConfirmationEmail(
            newUser.email, newUser.firstName, newUser.confirmationToken
        ).catch(err => console.error('Error mail bienvenida:', err));

        return this.generateAuthResponse(newUser);
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findOneByEmail(loginDto.email);
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        if (!user.isActive) {
            throw new BadRequestException('Debes confirmar tu email.');
        }

        return this.generateAuthResponse(user);
    }

    private generateAuthResponse(user: User) {
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
