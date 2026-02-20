import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/auth/mail.service';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<any>;

    const mockUsersService = {
        findOneByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-token'),
    };

    const mockMailService = {
        sendConfirmationEmail: jest.fn().mockResolvedValue(true),
    };

    const fullUserDto = {
        email: 'test@test.com',
        password: '123',
        firstName: 'Sensei',
        lastName: 'Yamaguchi',
        phone: '12345678',
        address: 'Dojo Street 123',
        city: 'San Fernando',
        zipCode: '1644',
        role: 'user',
        isActive: true,
        confirmationToken: 'token-falso-123'
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: MailService, useValue: mockMailService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('debería registrar un usuario exitosamente y devolver token', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue({ id: 1, ...fullUserDto });

            const result = await service.register(fullUserDto);

            // Ajustado a lo que tu código devuelve según la consola: { user, access_token }
            expect(result).toHaveProperty('access_token');
            expect(result.user).toHaveProperty('id');
            expect(mockUsersService.create).toHaveBeenCalled();
            expect(mockMailService.sendConfirmationEmail).toHaveBeenCalled();
        });

        it('debería lanzar ConflictException si el email ya existe', async () => {
            // Simulamos que el usuario ya existe en la DB
            mockUsersService.findOneByEmail.mockResolvedValue({ id: 1, ...fullUserDto });

            // IMPORTANTE: Tu código parece que no está lanzando la excepción. 
            // Asegúrate que en auth.service.ts, dentro de register, tengas:
            // if (userExists) throw new ConflictException(...)
            await expect(service.register(fullUserDto))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('debería hacer login y devolver el token si las credenciales son válidas', async () => {
            const mockUser = { id: 1, ...fullUserDto, password: 'hashed_password', isActive: true };
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

            const result = await service.login({ email: fullUserDto.email, password: 'correct_pass' });

            expect(result).toHaveProperty('access_token');
        });

        it('debería lanzar UnauthorizedException si el password es incorrecto', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue({ ...fullUserDto, password: 'hashed_password', isActive: true });
            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

            await expect(service.login({ email: fullUserDto.email, password: 'wrong_pass' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('debería lanzar BadRequestException si el usuario no está activo', async () => {
            // El error de consola indica que para llegar al check de isActive, 
            // primero el login debe encontrar al usuario y validar password.
            mockUsersService.findOneByEmail.mockResolvedValue({ ...fullUserDto, password: 'hashed_password', isActive: false });
            jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

            await expect(service.login({ email: fullUserDto.email, password: 'any_pass' }))
                .rejects.toThrow(BadRequestException);
        });
    });
});
