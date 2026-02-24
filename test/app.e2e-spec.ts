import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/main';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Product } from '../src/products/entities/product.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('Pastas Yamaguchi (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let cookie: string;
  let testProduct: Product;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);

    const userRepository = moduleFixture.get(getRepositoryToken(User));
    const hashedPassword = await bcrypt.hash('password123', 10);
    await userRepository.save({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Yamaguchi',
      role: 'admin',
      isActive: true,
    });

    const productRepository = moduleFixture.get(getRepositoryToken(Product));
    testProduct = await productRepository.save({
      name: 'Ravioles de Prueba',
      description: 'Pasta artesanal para test e2e',
      price: 1500.00,
      stock: 50,
      category: 'Simples'
    });
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Autenticación', () => {
    it('/auth/login (POST) - Debe retornar cookie de sesión', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      expect([200, 201]).toContain(res.status);
      const cookies = res.get('Set-Cookie');
      cookie = cookies.find(c => c.startsWith('access_token=')).split(';')[0];
      expect(cookie).toBeDefined();
    });
  });

  describe('Flujo de Compra', () => {
    it('Debe agregar al carrito y luego crear la orden', async () => {
      // 1. Agregar al carrito usando la ruta correcta: /cart/add
      await request(app.getHttpServer())
        .post('/cart/add')
        .set('Cookie', [cookie])
        .send({
          productId: testProduct.id,
          quantity: 2
        })
        .expect([200, 201]);

      // 2. Crear la orden (ahora el carrito ya no está vacío)
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', [cookie])
        .send({
          // Enviamos el total si tu DTO lo requiere, 
          // sino puedes enviar un objeto vacío {}
          total: 3000.00
        });

      if (res.status === 400) {
        console.log('❌ Error en Orden:', res.body.message);
      }

      expect([200, 201]).toContain(res.status);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('Productos', () => {
    it('/products (GET) - Debe listar productos (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
