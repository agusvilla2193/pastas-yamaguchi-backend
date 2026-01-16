import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege TODAS las rutas con JWT y Roles
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Roles('admin') // SOLO ADMINS
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get() // Cualquier usuario logueado puede ver la lista
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id') // Cualquier usuario logueado puede ver el detalle
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin') // SOLO ADMINS
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles('admin') // SOLO ADMINS
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
