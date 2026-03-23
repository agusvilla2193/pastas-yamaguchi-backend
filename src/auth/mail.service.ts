import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'), // Tu clave de 16 letras
            },
        });
    }

    async sendConfirmationEmail(email: string, firstName: string, token: string) {
        const url = `${this.configService.get<string>('FRONTEND_URL')}/confirm?token=${token}`;

        // LOG DE EMERGENCIA: Esto aparecerá en la consola de Render siempre
        console.log('----------------------------------------------------');
        console.log(`📧 INTENTO DE ENVÍO A: ${email}`);
        console.log(`🔗 LINK DE CONFIRMACIÓN: ${url}`);
        console.log('----------------------------------------------------');

        const mailOptions = {
            from: `"Yamaguchi Pastas" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: '🥟 ¡Bienvenido a Yamaguchi Pastas! Confirma tu cuenta',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #000; color: #fff; padding: 40px; border-radius: 20px;">
                    <h1 style="color: #ff0000; font-style: italic; text-transform: uppercase;">Kon'nichiwa, ${firstName}!</h1>
                    <p>Gracias por unirte a nuestra familia. Para empezar a disfrutar de la mejor pasta artesanal, confirma tu email haciendo clic abajo:</p>
                    <a href="${url}" style="display: inline-block; background-color: #ff0000; color: #fff; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px;">CONFIRMAR CUENTA</a>
                    <p style="font-size: 10px; color: #555; margin-top: 40px;">Si no creaste esta cuenta, ignora este mensaje.</p>
                </div>
            `,
        };

        try {
            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('❌ ERROR REAL DE GMAIL:', error.message);
            return null; // No lanzamos error para no romper el registro del usuario
        }
    }

    async sendResetPasswordEmail(email: string, firstName: string, token: string) {
        const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

        console.log('----------------------------------------------------');
        console.log(`🔑 RESET PASSWORD PARA: ${email}`);
        console.log(`🔗 LINK DE RESET: ${url}`);
        console.log('----------------------------------------------------');

        const mailOptions = {
            from: `"Yamaguchi Pastas" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: '🔒 Recuperar contraseña - Yamaguchi Pastas',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #000; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
                    <h2 style="color: #ff0000; font-style: italic;">¿Olvidaste tu clave, ${firstName}?</h2>
                    <p>Haz clic abajo para configurar una nueva contraseña. Este enlace expira en 1 hora.</p>
                    <a href="${url}" style="display: inline-block; background-color: #ff0000; color: #fff; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px;">RESTABLECER CONTRASEÑA</a>
                </div>
            `,
        };

        try {
            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('❌ ERROR RESET PASSWORD GMAIL:', error.message);
            return null;
        }
    }
}
