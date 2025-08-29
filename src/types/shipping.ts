export interface Shipping {
    order_id: number;
    price: number;
    shipping_days: number;
    shipping_type: 'express' | 'fast' | 'economical' | 'bulky';
}