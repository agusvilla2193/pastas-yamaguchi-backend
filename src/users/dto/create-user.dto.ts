import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'pastas@yamaguchi.com', description: 'Correo electrónico del usuario' })
    @IsEmail({}, { message: 'El formato del email es incorrecto.' })
    @IsNotEmpty()
    readonly email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña del usuario (mínimo 8 caracteres)', minLength: 8 })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    readonly password: string;

    @ApiProperty({ example: 'Agustín', description: 'Nombre del usuario' })
    @IsString()
    @IsNotEmpty()
    readonly firstName: string;

    @ApiProperty({ example: 'Yamaguchi', description: 'Apellido del usuario' })
    @IsString()
    @IsNotEmpty()
    readonly lastName: string;

    @ApiProperty({ example: '+541122334455', description: 'Teléfono de contacto para envíos' })
    @IsString()
    @IsNotEmpty({ message: 'El teléfono es necesario para la entrega.' })
    readonly phone: string;

    @ApiProperty({ example: 'Av. Corrientes 1234', description: 'Dirección de entrega' })
    @IsString()
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    readonly address: string;

    @ApiProperty({ example: 'CABA', description: 'Localidad/Ciudad' })
    @IsString()
    @IsNotEmpty({ message: 'La localidad es obligatoria.' })
    readonly city: string;

    @ApiProperty({ example: '1425', description: 'Código Postal', required: false })
    @IsString()
    @IsOptional()
    readonly zipCode?: string;
}
