import { Controller, Post, Body, Res, Req, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const authData = await this.authService.login(loginDto);

        response.cookie('access_token', authData.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return { user: authData.user };
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

    //Metodo de confirmacion
    @Get('confirm')
    async confirm(@Query('token') token: string) {
        return await this.usersService.confirmEmail(token);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req) {
        return req.user;
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token');
        return { message: 'Sesión cerrada' };
    }
}
