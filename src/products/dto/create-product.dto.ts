import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly price: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly stock: number;

    @IsString()
    @IsOptional()
    readonly image: string;
}
