import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    UseGuards,
    Get,
    Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserSession } from './interfaces/user-payload.interface';

/**
 * Interfaz extendida para tipar la Request con el usuario autenticado.
 */
interface RequestWithUser extends Request {
    user: UserSession;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ user: UserSession }> {
        const authData = await this.authService.login(loginDto);

        response.cookie('access_token', authData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 día
        });

        return { user: authData.user };
    }

    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ user: UserSession }> {
        const authData = await this.authService.register(createUserDto);

        response.cookie('access_token', authData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return { user: authData.user };
    }

    @Get('confirm')
    async confirm(@Query('token') token: string): Promise<{ message: string }> {
        const isConfirmed = await this.usersService.confirmEmail(token);
        return {
            message: isConfirmed
                ? 'Email confirmado exitosamente'
                : 'El token es inválido o ya fue usado',
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: RequestWithUser): UserSession {
        return req.user;
    }

    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string }> {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        return await this.authService.resetPassword(resetPasswordDto);
    }

    @Post('logout')
    async logout(
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ message: string }> {
        response.clearCookie('access_token');
        return { message: 'Sesión cerrada' };
    }
}
