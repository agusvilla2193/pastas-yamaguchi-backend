import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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

    @IsNotEmpty({ message: 'El teléfono es necesario para la entrega.' })
    @IsString()
    readonly phone: string;

    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    @IsString()
    readonly address: string;

    @IsNotEmpty({ message: 'La localidad es obligatoria.' })
    @IsString()
    readonly city: string;

    @IsOptional()
    @IsString()
    readonly zipCode: string;
}
