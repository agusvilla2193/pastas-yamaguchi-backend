import {
    Injectable,
    Inject,
    forwardRef,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
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

/**
 * Interface para manejar errores específicos de la SDK de Mercado Pago
 */
interface MercadoPagoError {
    message: string;
    status?: number;
    cause?: unknown;
}

@Injectable()
export class PaymentsService {
    private readonly client: MercadoPagoConfig;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @Inject(forwardRef(() => OrdersService))
        private readonly ordersService: OrdersService,
    ) {
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            this.logger.error('MP_ACCESS_TOKEN no definido en el entorno');
        }
        this.client = new MercadoPagoConfig({
            accessToken: accessToken || '',
        });
    }

    /**
     * Crea una preferencia de pago en Mercado Pago y retorna el punto de inicio (URL)
     */
    async createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');
        const backendUrl = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

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
            const mpError = error as MercadoPagoError;
            this.logger.error(`❌ Error en Mercado Pago: ${mpError.message || 'Sin mensaje'}`);
            throw new InternalServerErrorException('Error al comunicarse con la pasarela de pagos');
        }
    }

    /**
     * Procesa la notificación (Webhook) enviada por Mercado Pago
     */
    async handleWebhook(paymentId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const payment = new Payment(this.client);

            // Obtenemos los detalles del pago desde MP
            const paymentDetails = await payment.get({ id: paymentId });

            const orderId = paymentDetails.external_reference;
            const status = paymentDetails.status;

            this.logger.log(`[Webhook] Pago MP #${paymentId} - Status: ${status} - Orden: ${orderId}`);

            if (status === 'approved' && orderId) {
                // Actualización de estado en la base de datos
                await this.ordersService.updateOrderStatus(Number(orderId), 'PAID');
                this.logger.log(`✅ Orden ${orderId} actualizada a PAID satisfactoriamente.`);
            } else {
                this.logger.warn(`[Webhook] El pago ${paymentId} no fue aprobado o carece de referencia.`);
            }

            return { success: true };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error('❌ Error crítico en el Webhook:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}
