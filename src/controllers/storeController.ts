import { Request, Response } from "express";
import pool from '../config/db';
import { StoreOutput  } from '../types/store';
import { createAddress, createStore, createOwner } from "../services/storeService";

export const registerStore = async (req: Request, res: Response) => {
    const { name, address, email, phone_number } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (req.user?.id === undefined) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'User ID is required to create a store owner.' });
            return;
        };

        const address_id: number = await createAddress(address);

        const newStore: StoreOutput = await createStore({
            name,
            address_id,
            email,
            phone_number,
        });

        /*MUST ADD CONTROLL TO BOTH SERVICES QUERY*/

        await createOwner({
            store_id: newStore.id,
            app_user_id: req.user.id,
            role: 'owner',
        });

        await client.query('COMMIT');
        res.status(201).json(newStore);

    }catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in the creation of the store:', err);
        res.status(500).json({
            error: 'Error in the creation of the store',
        });
    } finally {
        client.release();
    };
};