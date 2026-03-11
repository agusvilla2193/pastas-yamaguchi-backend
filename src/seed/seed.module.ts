import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from 'src/users/users.module';
import { SeedController } from './seed.controller';

@Module({
    imports: [ProductsModule, UsersModule], // Necesitamos ProductsModule para usar su servicio
    controllers: [SeedController],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }
