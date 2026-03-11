import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service'; // Necesitamos este servicio
import { SEED_DATA } from './data/seed-data';

@Injectable()
export class SeedService {
    constructor(
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService, // Inyectamos UsersService
    ) { }

    async executeSeed() {
        // 1. Crear el Administrador
        // Primero verificamos si ya existe para no duplicarlo
        const adminExists = await this.usersService.findOneByEmail(SEED_DATA.adminUser.email);

        if (!adminExists) {
            await this.usersService.create(SEED_DATA.adminUser);
            console.log('Admin creado correctamente');
        }

        // 2. Insertar productos
        const insertPromises = SEED_DATA.products.map(product =>
            this.productsService.create(product)
        );

        await Promise.all(insertPromises);

        return 'Seed completado: Admin y Productos cargados en el Dojo.';
    }
}
