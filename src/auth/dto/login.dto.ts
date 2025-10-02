import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail({}, { message: 'El email debe ser válido.' })
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
