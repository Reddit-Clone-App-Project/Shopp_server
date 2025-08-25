import { Request, Response } from "express";
import { stripe } from "../config/stripe";

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

    if(event.type === 'checkout.session.completed'){
        // Handle successful checkout session
        const session = event.data.object;

        console.log(session);
    }

    res.status(200).send();
}