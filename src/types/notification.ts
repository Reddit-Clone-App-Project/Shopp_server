export interface Notification {
    user_id: number;
    title: string;
    content: string;
    type: 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'promotion' | 'system_alert';
}