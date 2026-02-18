import {
    Injectable,
    Inject,
    forwardRef,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { OrdersService } from '../orders/orders.service';

export interface PaymentItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface CreatePreferenceData {
    orderId: string | number;
    items: PaymentItem[];
}

export interface PreferenceResponse {
    init_point: string | undefined;
}

@Injectable()
export class PaymentsService {
    private readonly client: MercadoPagoConfig;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @Inject(forwardRef(() => OrdersService))
        private readonly ordersService: OrdersService,
        private readonly configService: ConfigService,
    ) {
        const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
        if (!accessToken) {
            this.logger.error('MP_ACCESS_TOKEN no definido en el entorno');
        }
        this.client = new MercadoPagoConfig({
            accessToken: accessToken || '',
        });
    }

    async createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
        const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001').replace(/\/$/, '');
        const backendUrl = (this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000').replace(/\/$/, '');

        try {
            const preference = new Preference(this.client);
            this.logger.log(`[MP] Generando preferencia para Orden #${data.orderId}`);

            const result = await preference.create({
                body: {
                    items: data.items.map((item) => ({
                        id: item.productId,
                        title: item.name,
                        unit_price: Number(item.price),
                        quantity: Number(item.quantity),
                        currency_id: 'ARS',
                    })),
                    back_urls: {
                        success: `${frontendUrl}/checkout/success`,
                        failure: `${frontendUrl}/checkout`,
                        pending: `${frontendUrl}/checkout`,
                    },
                    auto_return: 'approved',
                    external_reference: String(data.orderId),
                    notification_url: `${backendUrl}/payments/webhook`,
                },
            });

            return { init_point: result.init_point };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`❌ Error en Mercado Pago: ${errorMessage}`);
            throw new InternalServerErrorException('Error al comunicarse con la pasarela de pagos');
        }
    }

    async handleWebhook(paymentId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const payment = new Payment(this.client);
            const paymentDetails = await payment.get({ id: paymentId });

            if (!paymentDetails || !paymentDetails.external_reference) {
                this.logger.warn(`Webhook recibido para pago ${paymentId} sin referencia externa.`);
                return { success: true };
            }

            const orderId = paymentDetails.external_reference;
            const status = paymentDetails.status;

            this.logger.log(`[Webhook] Pago MP #${paymentId} - Status: ${status} - Orden: ${orderId}`);

            if (status === 'approved') {
                await this.ordersService.updateOrderStatus(Number(orderId), 'PAID');
                this.logger.log(`✅ Orden ${orderId} actualizada a PAID satisfactoriamente.`);
            }

            return { success: true };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error('❌ Error crítico en el Webhook:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}
