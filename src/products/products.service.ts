import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  // Obtiene todos los productos
  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  // Busca un producto por ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  // Crea un nuevo producto
  create(product: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(product);
    return this.productsRepository.save(newProduct);
  }

  // Actualiza un producto existente
  async update(id: number, product: UpdateProductDto): Promise<Product> {
    const productToUpdate = await this.findOne(id);
    this.productsRepository.merge(productToUpdate, product);
    return this.productsRepository.save(productToUpdate);
  }

  // Elimina un producto
  async remove(id: number): Promise<void> {
    const productToRemove = await this.findOne(id);
    await this.productsRepository.remove(productToRemove);
  }
}
