import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    readonly token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    readonly newPassword: string;
}
