import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface CheckoutItem {
    product_name: String, 
    image_url: String, 
    price_at_purchase: number, 
    product_variant_id: number, 
    quantity: number, 
    variant_name: String
}

export const createCheckoutSession = async(req: Request, res: Response) => {
    const { items } = req.body;

    const line_items = items.map((item: CheckoutItem) => ({
        price_data:{
            currency: "usd",
            product_data: {
                name: item.product_name,
                images:[item.image_url]
            },
            unit_amount: item.price_at_purchase * 100,
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/fail`,
    });

    res.json({ id: session.id });
}