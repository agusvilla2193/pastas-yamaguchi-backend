import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
    @IsString()
    @IsNotEmpty()
    readonly productId: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsNumber()
    @Min(0)
    readonly price: number;

    @IsNumber()
    @Min(1)
    readonly quantity: number;
}

export class CreatePreferenceDto {
    @IsString()
    @IsNotEmpty()
    readonly orderId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemDto)
    readonly items: ItemDto[];
}
