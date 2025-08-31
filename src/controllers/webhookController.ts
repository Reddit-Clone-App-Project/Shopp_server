import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import pool from "../config/db";
import { updatePaymentTransactionId } from "../services/paymentService";
import { parse } from "path";
import { updateOrderStatusByPaymentId } from "../services/orderService";
import { createOrderLog } from "../services/orderLogService";
import { createNotification } from "../services/notificationService";

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
        let uid;
        let title = 'Order Confirmed';
        let content = '';
        if(event.type === 'checkout.session.completed'){
            // Handle successful checkout session
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata) {
                const { paymentId, userId } = metadata as { paymentId?: string; userId?: string };
                uid = userId;
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
            }
            content = 'Your order has been confirmed and is now pending.';
        }
        if(event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired'){
            const session = event.data.object;
            const metadata = session.metadata;
            if(metadata){
                const { paymentId, userId } = metadata as { paymentId?: string; userId?: string };
                uid = userId;
            }
            content = 'Your order is placed, but the order payment has failed or the session has expired. Please try again.';
        }
        await createNotification({
            user_id: parseInt(uid!),
            title,
            content,
            type: 'order_confirmed'
        });

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