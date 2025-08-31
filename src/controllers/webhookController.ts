import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import pool from "../config/db";
import { createPayment, updatePaymentTransactionId } from "../services/paymentService";
import { createOrder, updateOrderStatusByPaymentId } from "../services/orderService";
import { createOrderLog } from "../services/orderLogService";
import { createNotification } from "../services/notificationService";
import { createOrderItem } from "../services/orderItem";
import { createShipping } from "../services/shippingService";

export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;

    try{
        if (!sig || typeof sig !== 'string') {
            res.status(400).send('Missing or invalid Stripe signature');
            return;
        }
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch(err){
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // let uid;
        // let title = 'Order Confirmed';
        // let content = '';
        if(event.type === 'checkout.session.completed'){
            // Handle successful checkout session
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata) {
                const checkout_type = metadata.checkout_type;

                if (checkout_type === 'cart') {
                    const { paymentId, userId } = metadata as { paymentId?: string; userId?: string };
                    // uid = userId;
                    const payment = await updatePaymentTransactionId(parseInt(paymentId!), session.id);
                    const orders = await updateOrderStatusByPaymentId(payment.id, 'paid');
                    orders.forEach(async order => {
                        await createOrderLog({
                            order_id: order.id,
                            status: 'Order Pending',
                            storage_id: null,
                            shipper_id: null
                        });
                    });
                 
                    await createNotification({
                        user_id: parseInt(userId!),
                        title: 'Order Confirmed',
                        content: 'Your order has been confirmed and is now pending.',
                        type: 'order_confirmed'
                    });
                } else if (checkout_type === 'single_item') {
                    const { userId, address_id, item } = metadata;
                    const parsedItem = JSON.parse(item!);

                    const payment = await createPayment(parseInt(userId!), parsedItem.price_at_purchase * parsedItem.quantity);
                    await updatePaymentTransactionId(payment.id, session.id);

                    const order = await createOrder({
                        app_user_id: parseInt(userId!),
                        address_id: parseInt(address_id!),
                        status: 'paid',
                        payment_id: payment.id,
                        total_without_shipping: parsedItem.price_at_purchase * parsedItem.quantity,
                        store_id: parsedItem.store_id // Make sure to include store_id in the item metadata
                    });

                    await createOrderItem({
                        order_id: order.id,
                        product_variant_id: parsedItem.product_variant_id,
                        quantity: parsedItem.quantity,
                        price_at_purchase: parsedItem.price_at_purchase
                    });

                    if(typeof session.shipping_cost?.amount_total === 'number'){
                        let shipping_days;
                        let shipping_type: 'express' | 'fast' | 'economical' | 'bulky';

                        switch(session.shipping_cost?.amount_total){
                            case 3000:
                                shipping_days = 12;
                                shipping_type = 'express';
                                break;
                            case 2500:
                                shipping_days = 20;
                                shipping_type = 'fast';
                                break;
                            case 1500:
                                shipping_days = 30;
                                shipping_type = 'economical';
                                break;
                            case 5000:
                                shipping_days = 30;
                                shipping_type = 'bulky';
                                break;
                            default:
                                shipping_days = 30;
                                shipping_type = 'economical';
                                break;
                        }

                        await createShipping({
                            order_id: order.id,
                            price: (session.shipping_cost.amount_total / 100),
                            shipping_days: shipping_days,
                            shipping_type: shipping_type
                        });
                    }


                    await createOrderLog({
                        order_id: order.id,
                        status: 'Order confirmed',
                        storage_id: null,
                        shipper_id: null
                    });

                    await createNotification({
                        user_id: parseInt(userId!),
                        title: 'Your Purchase is Confirmed',
                        content: `Your purchase of ${parsedItem.product_name} has been confirmed.`,
                        type: 'order_confirmed'
                    });
                }
            }
            // content = 'Your order has been confirmed and is now pending.';
        }
        if(event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired'){
            const session = event.data.object;
            const metadata = session.metadata;
            if(metadata){
                const { userId } = metadata as { paymentId?: string; userId?: string };
                await createNotification({
                    user_id: parseInt(userId!),
                    title: 'Your Payment Failed',
                    content: 'Your order have been placed, but your payment has failed. Please try again.',
                    type: 'order_confirmed'
                });
            }
        }

        await client.query('COMMIT');
        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook event:', error);
        await client.query('ROLLBACK');
        res.status(500).send('Internal Server Error');

    } finally {
        client.release();
    }
}