import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Sorrentinos de Calabaza', description: 'Nombre del producto' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ example: 'Caja de 12 unidades elaboradas con masa artesanal', description: 'Descripción detallada' })
    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @ApiProperty({ example: 'Pastas Rellenas', description: 'Categoría del producto' })
    @IsString()
    @IsNotEmpty()
    readonly category: string;

    @ApiProperty({ example: 5500.50, description: 'Precio unitario' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    readonly price: number;

    @ApiProperty({ example: 50, description: 'Stock disponible' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    readonly stock: number;

    @ApiProperty({ example: 'https://link-imagen.com/pasta.jpg', description: 'URL de la imagen', required: false })
    @IsString()
    @IsOptional()
    readonly image?: string;
}
