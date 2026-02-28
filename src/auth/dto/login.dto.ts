import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@yamaguchi.com' })
    @IsNotEmpty()
    @IsEmail({}, { message: 'El email debe ser válido.' })
    readonly email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
