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
    private readonly productsRepository: Repository<Product>, // Añadimos readonly
  ) { }

  /**
   * Obtiene todos los productos de la base de datos.
   */
  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  /**
   * Busca un producto por ID. 
   * Lanza NotFoundException si no existe para centralizar el error.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  /**
   * Crea un nuevo producto basado en el DTO.
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(newProduct);
  }

  /**
   * Actualiza un producto existente.
   * Usamos el spread operator para evitar problemas de solo lectura en el DTO.
   */
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const productToUpdate = await this.findOne(id);

    // Clonamos el DTO para asegurar que TypeORM trabaje con un objeto plano
    const dataToUpdate = { ...updateProductDto };

    // Merge actualiza el objeto productToUpdate con los nuevos datos
    const mergedProduct = this.productsRepository.merge(productToUpdate, dataToUpdate);

    return this.productsRepository.save(mergedProduct);
  }

  /**
   * Elimina un producto por completo.
   */
  async remove(id: number): Promise<void> {
    const productToRemove = await this.findOne(id);
    await this.productsRepository.remove(productToRemove);
  }
}
