import {
    Controller,
    Post,
    Body,
    Res,
    Get,
    Query,
    UseGuards,
    Req,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, AuthData } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    address?: string;
}

interface AuthSuccessResponse {
    user: UserResponse;
}

interface JwtUserPayload {
    id: number;
    email: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user: JwtUserPayload;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthSuccessResponse> {
        // Ahora data es de tipo AuthData, que TIENE access_token y user
        const data: AuthData = await this.authService.login(loginDto);
        this.setAuthCookie(res, data.access_token);
        return { user: data.user };
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthSuccessResponse> {
        const data: AuthData = await this.authService.register(dto);
        this.setAuthCookie(res, data.access_token);
        return { user: data.user };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response): { message: string } {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });
        return { message: 'Sesión cerrada exitosamente' };
    }

    @Get('confirm')
    async confirm(@Query('token') token: string): Promise<{ message: string }> {
        const ok = await this.usersService.confirmEmail(token);
        return {
            message: ok ? 'Email confirmado exitosamente' : 'El token es inválido o ya expiró'
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: AuthenticatedRequest): JwtUserPayload {
        return req.user;
    }

    private setAuthCookie(res: Response, token: string): void {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24,
            path: '/',
        });
    }
}
