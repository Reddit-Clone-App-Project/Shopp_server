import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { createPayment } from '../services/paymentService';
import type Stripe from 'stripe';
import { createOrder } from '../services/orderService';
import { createOrderLog } from '../services/orderLogService';
import pool from '../config/db';
import { createShipping } from '../services/shippingService';
import { removeItemFromCartByUserId } from '../services/cartService';
import { createOrderItem } from '../services/orderItem';

interface CheckoutItem {
    product_name: string, 
    image_url: string, 
    price_at_purchase: number, 
    product_variant_id: number, 
    quantity: number, 
}

interface SingleCheckoutItem extends CheckoutItem {
    express_shipping: boolean;
    fast_shipping: boolean;
    economical_shipping: boolean;
    bulky_shipping: boolean;
    store_id: number;
}

interface CheckOutCart {
    store_id: number;
    items: CheckoutItem[];
    shipping_cost: number;
}

const calculateShippingDays = (shippingCost: number): number => {
    if(shippingCost === 30) return 12;
    if(shippingCost === 25) return 20;
    if(shippingCost === 15) return 30;
    if(shippingCost === 50) return 30; 
    return 30;
}

const calculateShippingType = (shippingCost: number): 'express' | 'fast' | 'economical' | 'bulky' => {
    if(shippingCost === 30) return 'express';
    if(shippingCost === 25) return 'fast';
    if(shippingCost === 15) return 'economical';
    if(shippingCost === 50) return 'bulky'; 
    return 'economical'; // default case
}

export const createCheckoutSession = async(req: Request, res: Response) => {
    if(req.user?.id === undefined){
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { stores, total_shipping_cost, address_id } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const line_items_promises = stores.flatMap((store: CheckOutCart) => {
            return store.items.map(async (item: CheckoutItem) => { 
                await removeItemFromCartByUserId(req.user!.id, item.product_variant_id);
                return {
                price_data:{
                    currency: "usd",
                    product_data: {
                        name: item.product_name,
                        images:[item.image_url]
                },
                unit_amount: Math.round(item.price_at_purchase * 100),
            },
            quantity: item.quantity,
        }})});
    
        const line_items = await Promise.all(line_items_promises);

        const total_without_shipping = line_items.reduce((sum: number, item: any) => sum + item.price_data.unit_amount * item.quantity, 0);

        const payment = await createPayment(req.user.id, total_without_shipping / 100 + total_shipping_cost);
        stores.forEach(async (store: CheckOutCart) => {
            const total_without_shipping = store.items.reduce((sum: number, item: CheckoutItem) => sum + item.price_at_purchase * item.quantity, 0);
            const order = await createOrder({
                app_user_id: req.user!.id,
                address_id,
                status: 'pending',
                payment_id: payment.id,
                total_without_shipping: total_without_shipping,
                store_id: store.store_id
            });

            store.items.forEach(async (item: CheckoutItem) => {
                await createOrderItem({
                    order_id: order.id,
                    product_variant_id: item.product_variant_id,
                    quantity: item.quantity,
                    price_at_purchase: item.price_at_purchase
                });
            });

            await createShipping({
                order_id: order.id,
                price: store.shipping_cost,
                shipping_days: calculateShippingDays(store.shipping_cost),
                shipping_type: calculateShippingType(store.shipping_cost)
            });

            await createOrderLog({
                order_id: order.id,
                status: 'Wait for payment',
                storage_id: null,
                shipper_id: null
            });
        });

        

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            metadata: {
                paymentId: payment.id.toString(),
                userId: req.user.id.toString(),
                checkout_type: 'cart'
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: Math.round(total_shipping_cost * 100),
                            currency: 'usd',
                        },
                        display_name: 'Total Shipping Fee',
                    },
                }
            ],
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/fail`,
        });
        await client.query("COMMIT");
        res.json({ id: session.id });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }

};


export const createSingleProductCheckout = async(req: Request, res: Response) => {
    if(req.user?.id === undefined){
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { item, address_id } = req.body as { item: SingleCheckoutItem, address_id: number };

    try {
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product_name,
                    images: [item.image_url],
                },
                unit_amount: item.price_at_purchase * 100,
            },
            quantity: item.quantity,
        }];

        const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
        if(item.express_shipping){
            shipping_options.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(30 * 100),
                        currency: 'usd',
                    },
                    display_name: 'Express Shipping',
                },
            });
        }

        if(item.fast_shipping){
            shipping_options.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(25 * 100),
                        currency: 'usd',
                    },
                    display_name: 'Fast Shipping',
                },
            });
        }

        if(item.economical_shipping){
            shipping_options.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(15 * 100),
                        currency: 'usd',
                    },
                    display_name: 'Economical Shipping',
                },
            });
        }

        if(item.bulky_shipping){
            shipping_options.push({
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(50 * 100),
                        currency: 'usd',
                    },
                    display_name: 'Bulky Shipping',
                },
            });
        }

        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            metadata: {
                userId: req.user.id.toString(),
                address_id: address_id.toString(),
                item: JSON.stringify(item),
                checkout_type: 'single_item'
            },
            shipping_options: shipping_options,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/fail`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}