import { Controller, Post, Body, Res, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response // Inyectamos la respuesta
    ) {
        const authData = await this.authService.login(loginDto);

        // Seteamos la cookie
        response.cookie('access_token', authData.access_token, {
            httpOnly: true, // Inaccesible para JS del front
            secure: false,  // true solo en producción (HTTPS)
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 día
        });

        return { user: authData.user }; // Ya no enviamos el token en el body
    }

    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const authData = await this.authService.register(createUserDto);

        response.cookie('access_token', authData.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return { user: authData.user };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req) {
        return req.user; // El Guard ya puso el usuario en el req
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token');
        return { message: 'Sesión cerrada' };
    }
}
