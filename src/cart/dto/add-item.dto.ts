import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class AddItemDto {
    @IsNotEmpty()
    @IsNumber()
    readonly productId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    readonly quantity: number;
}
