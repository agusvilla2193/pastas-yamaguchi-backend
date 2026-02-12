export interface CreatePreferenceDto {
    orderId: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
}
