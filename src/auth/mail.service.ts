import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true para puerto 465
            auth: {
                user: this.configService.get<string>('MAIL_USER'), // Tu email
                pass: this.configService.get<string>('MAIL_PASS'), // Contraseña de 16 dígitos
            },
        });
    }

    async sendConfirmationEmail(email: string, firstName: string, token: string) {
        // URL de tu frontend (luego la pondremos en el .env)
        const url = `${this.configService.get<string>('FRONTEND_URL')}/confirm?token=${token}`;

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

        return await this.transporter.sendMail(mailOptions);
    }

    async sendResetPasswordEmail(email: string, firstName: string, token: string) {
        const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Yamaguchi Pastas" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: '🔒 Recuperar contraseña - Yamaguchi Pastas',
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #000; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
                <h2 style="color: #ff0000; font-style: italic;">¿Olvidaste tu clave, ${firstName}?</h2>
                <p>No hay problema, hasta los mejores maestros necesitan recuperar fuerzas. Haz clic en el botón de abajo para configurar una nueva contraseña. Este enlace expira en 1 hora.</p>
                <a href="${url}" style="display: inline-block; background-color: #ff0000; color: #fff; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px;">RESTABLECER CONTRASEÑA</a>
                <p style="font-size: 10px; color: #555; margin-top: 40px;">Si no solicitaste este cambio, puedes ignorar este mail de forma segura.</p>
            </div>
        `,
        };

        return await this.transporter.sendMail(mailOptions);
    }
}
