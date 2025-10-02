import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly price: number;
}
