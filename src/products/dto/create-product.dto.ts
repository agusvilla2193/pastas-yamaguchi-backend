import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @IsString()
    @IsNotEmpty()
    readonly category: string;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    readonly price: number;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    readonly stock: number;

    @IsString()
    @IsOptional()
    readonly image?: string;
}
