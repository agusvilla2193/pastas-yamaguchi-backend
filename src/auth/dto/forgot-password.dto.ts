import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'password123' })
    @IsEmail({}, { message: 'Debe ingresar un email válido.' })
    @IsNotEmpty()
    readonly email: string;
}
