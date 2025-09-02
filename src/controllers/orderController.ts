import { Request, Response } from "express";
import { getAllOrdersByUserId, getOrderDetailById, deleteOrder } from "../services/orderService";


export const getOrdersByUserId = async (req: Request, res: Response) => {
    if(req.user?.id === undefined){
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const userId = req.user?.id;
    try {
        const orders = await getAllOrdersByUserId(userId);
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getOrderDetailByOrderId = async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
        res.status(400).json({ error: "Invalid order ID" });
        return;
    }
    try {
        const order = await getOrderDetailById(orderId);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const removeOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({ error: "Invalid order ID" });
            return;
        }
        await deleteOrder(orderId);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}