import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: any;

  const mockProductRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (Crear producto)', () => {
    it('debería crear un producto exitosamente', async () => {
      const productDto = { name: 'Sorrentinos', price: 1200, stock: 50 };
      repository.save.mockResolvedValue({ id: 1, ...productDto });

      const result = await service.create(productDto as any);
      expect(result).toHaveProperty('id');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findOne (Producto inexistente)', () => {
    it('debería lanzar NotFoundException si el producto no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Stock Logic (Lógica de inventario)', () => {
    it('debería actualizar el stock correctamente si el valor es válido', async () => {
      const existingProduct = { id: 1, name: 'Fideos', stock: 10 };
      repository.findOneBy.mockResolvedValue(existingProduct);
      repository.save.mockResolvedValue({ ...existingProduct, stock: 20 });

      const result = await service.update(1, { stock: 20 });
      expect(result.stock).toBe(20);
    });

    it('debería lanzar BadRequestException si el stock enviado es negativo', async () => {
      const existingProduct = { id: 1, name: 'Fideos', stock: 10 };
      repository.findOneBy.mockResolvedValue(existingProduct);

      // Intentamos poner stock en -5
      await expect(service.update(1, { stock: -5 }))
        .rejects.toThrow(BadRequestException);

      // Verificamos que NI SIQUIERA intentó guardar en la DB
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
