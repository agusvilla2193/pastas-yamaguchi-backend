import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(newProduct);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const productToUpdate = await this.findOne(id);

    // --- NUEVA VALIDACIÓN DE STOCK ---
    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('El stock no puede ser un número negativo.');
    }

    const dataToUpdate = { ...updateProductDto };
    const mergedProduct = this.productsRepository.merge(productToUpdate, dataToUpdate);

    return this.productsRepository.save(mergedProduct);
  }

  async remove(id: number): Promise<void> {
    const productToRemove = await this.findOne(id);
    await this.productsRepository.remove(productToRemove);
  }
}
