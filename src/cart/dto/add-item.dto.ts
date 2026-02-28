import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class AddItemDto {
    @ApiProperty({ example: 1, description: 'ID numérico del producto' })
    @IsNotEmpty()
    @IsNumber()
    readonly productId: number;

    @ApiProperty({ example: 3, description: 'Cantidad a agregar', minimum: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    readonly quantity: number;
}
