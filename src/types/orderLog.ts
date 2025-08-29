export interface OrderLog {
    order_id: number;
    storage_id: number | null;
    shipper_id: number | null;
    status: 'Wait for payment' | 'Order Pending' | 'Order confirmed' | 'Packaging' | 'Shipping unit receives the package' | 'Transferring to the next storage' | 'Pay attention to your phone, the shipper is delivering to you' | 'Delivered successfully' | 'Delivered fail, returning to the store';
}
