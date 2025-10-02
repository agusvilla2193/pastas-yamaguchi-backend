import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail({}, { message: 'El formato del email es incorrecto.' })
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly firstName: string;

    @IsNotEmpty()
    @IsString()
    readonly lastName: string;

    // El rol se puede manejar de forma opcional o 
    // se puede setear por defecto 'user' en el servicio.
}
