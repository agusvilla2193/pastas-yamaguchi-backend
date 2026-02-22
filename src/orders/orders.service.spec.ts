import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { CartService } from '../cart/cart.service';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let cartService: CartService;

  // Mock del QueryRunner para las transacciones
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOneBy: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockProductRepository = {
    save: jest.fn(),
  };

  const mockCartService = {
    findCartByUserId: jest.fn(),
    clearCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: CartService, useValue: mockCartService },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const userId = 1;
    const mockUser = { id: userId, email: 'test@test.com' };
    const mockCart = {
      items: [
        { product: { id: 10, name: 'Sorrentinos', price: 1000 }, quantity: 2 }
      ]
    };
    const mockProduct = { id: 10, name: 'Sorrentinos', price: 1000, stock: 5 };

    it('debería crear una orden válida exitosamente', async () => {
      // Configuramos los mocks para este caso de éxito
      mockCartService.findCartByUserId.mockResolvedValue(mockCart);
      mockQueryRunner.manager.findOneBy
        .mockResolvedValueOnce(mockUser)    // Primera llamada busca User
        .mockResolvedValueOnce(mockProduct); // Segunda llamada busca Product

      // Simulamos el guardado de la orden y los items
      mockQueryRunner.manager.save.mockResolvedValue({ id: 99, total: 2000 });

      // Simulamos la recuperación final de la orden con sus relaciones
      mockOrderRepository.findOne.mockResolvedValue({ id: 99, status: 'PENDING', total: 2000 });

      const result = await service.createOrder(userId);

      expect(result.id).toBe(99);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockCartService.clearCart).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar BadRequestException si el carrito está vacío', async () => {
      mockCartService.findCartByUserId.mockResolvedValue({ items: [] });

      await expect(service.createOrder(userId))
        .rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no hay stock suficiente', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 }; // Solo hay 1, pero el carrito pide 2

      mockCartService.findCartByUserId.mockResolvedValue(mockCart);
      mockQueryRunner.manager.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(lowStockProduct);

      await expect(service.createOrder(userId))
        .rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockCartService.findCartByUserId.mockResolvedValue(mockCart);
      mockQueryRunner.manager.findOneBy.mockResolvedValueOnce(null); // Usuario no encontrado

      await expect(service.createOrder(userId))
        .rejects.toThrow(NotFoundException);
    });
  });
});
