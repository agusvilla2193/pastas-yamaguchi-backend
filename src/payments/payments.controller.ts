import {
    Controller,
    Post,
    Body,
    InternalServerErrorException,
    Logger,
    UseGuards,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { PaymentsService, CreatePreferenceData, PreferenceResponse } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface MercadoPagoWebhookDto {
    action: string;
    api_version: string;
    data: {
        id: string;
    };
    date_created: string;
    id: number;
    live_mode: boolean;
    type: string;
    user_id: string;
}

@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-preference')
    @HttpCode(HttpStatus.OK)
    async createPreference(
        @Body() data: CreatePreferenceData
    ): Promise<PreferenceResponse> {
        this.logger.log(`Iniciando flujo de pago para la orden: ${data.orderId}`);

        try {
            return await this.paymentsService.createPreference(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Falla en creación de preferencia: ${errorMessage}`);
            throw new InternalServerErrorException('No se pudo establecer conexión con el Dojo de Pagos');
        }
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() body: MercadoPagoWebhookDto
    ): Promise<{ received: boolean; success?: boolean }> {
        // IMPORTANTE: Mercado Pago a veces envía eventos que no son 'payment' (ej. merchant_order)
        this.logger.debug(`Webhook recibido tipo: ${body.type}`);

        if (body.type === 'payment') {
            const paymentId = body.data?.id;
            if (!paymentId) return { received: true, success: false };

            try {
                const result = await this.paymentsService.handleWebhook(paymentId);
                return { received: true, success: result.success };
            } catch (error: unknown) {
                this.logger.error(`Error procesando Webhook de pago ${paymentId}:`, error);
                // Respondemos 200 OK para evitar que el servidor de MP se sature reintentando
                return { received: true, success: false };
            }
        }

        return { received: true };
    }
}
