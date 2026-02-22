import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  // Creamos un Mock del repositorio de TypeORM para no tocar la base de datos real
  const mockUserRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          // Le decimos a Nest que cuando pida el repositorio de User, use nuestro Mock
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un usuario exitosamente', async () => {
      const dto = { email: 'test@test.com', password: '123', firstName: 'Juan', lastName: 'Perez' };
      // Simulamos que la base de datos guarda y retorna el usuario con un ID
      mockUserRepository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('test@test.com');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('debería encontrar un usuario por email', async () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@test.com' });
    });

    it('debería retornar null si el usuario no existe', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneByEmail('nada@test.com');

      expect(result).toBeNull();
    });
  });
});
