import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Debe ingresar un email válido.' })
    @IsNotEmpty()
    readonly email: string;
}
