export interface NewOrder {
    app_user_id: number;
    address_id: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'failed';
    payment_id: number;
    total_without_shipping: number;
    store_id: number;
}

export interface OrderItem {
    order_id: number;
    product_variant_id: number;
    quantity: number;
    price_at_purchase: number;
}