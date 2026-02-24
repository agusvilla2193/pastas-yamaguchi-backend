import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'El formato del email es incorrecto.' })
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    readonly lastName: string;

    @IsString()
    @IsNotEmpty({ message: 'El teléfono es necesario para la entrega.' })
    readonly phone: string;

    @IsString()
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    readonly address: string;

    @IsString()
    @IsNotEmpty({ message: 'La localidad es obligatoria.' })
    readonly city: string;

    @IsString()
    @IsOptional()
    readonly zipCode?: string;
}
