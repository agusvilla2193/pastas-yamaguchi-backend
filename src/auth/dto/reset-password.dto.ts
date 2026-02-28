import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ example: 'ABC123' })
    @IsString()
    @IsNotEmpty()
    readonly token: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    readonly newPassword: string;
}
