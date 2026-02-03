import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}
