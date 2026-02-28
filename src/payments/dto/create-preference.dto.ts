import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
    @ApiProperty({ example: '123', description: 'ID del producto' })
    @IsString()
    @IsNotEmpty()
    readonly productId: string;

    @ApiProperty({ example: 'Sorrentinos', description: 'Nombre' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ example: 4500, description: 'Precio' })
    @IsNumber()
    @Min(0)
    readonly price: number;

    @ApiProperty({ example: 2, description: 'Cantidad' })
    @IsNumber()
    @Min(1)
    readonly quantity: number;
}

export class CreatePreferenceDto {
    @ApiProperty({ example: 'ORD-5566', description: 'ID de la orden de compra' })
    @IsString()
    @IsNotEmpty()
    readonly orderId: string;

    @ApiProperty({ type: [ItemDto], description: 'Lista de productos comprados' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemDto)
    readonly items: ItemDto[];
}
