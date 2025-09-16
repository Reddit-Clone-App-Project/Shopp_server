import { Request, Response } from "express";
import { getAllOrdersByUserId, getOrderDetailById, deleteOrder, getAllOrdersByStoreId, updateShippingUnitForOrder, checkWhetherOrderCanUpdateShippingUnit } from "../services/orderService";
import { checkStoreOwner } from "../services/storeService";

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

export const getOrderByStoreId = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(userId === undefined){
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) {
        res.status(400).json({ error: "Invalid store ID" });
        return;
    }

    try {
        const isStoreOwner: boolean = await checkStoreOwner(storeId, userId);
        if (!isStoreOwner) {
            res.status(403).json({ error: 'You must be the owner of the store!' });
            return;
        }

        const orders = await getAllOrdersByStoreId(storeId);
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateShippingUnitByOrderId = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if(userId === undefined){
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const orderId = parseInt(req.params.id);
    const storeId = parseInt(req.params.storeId);
    const { shipping_method } = req.body;
    if (isNaN(orderId)) {
        res.status(400).json({ error: "Invalid order ID" });
        return;
    }
    if (!['American Post', 'Europe Express', 'Fast Post', 'Airline Express'].includes(shipping_method)) {
        res.status(400).json({ error: "Invalid shipping method" });
        return;
    }

    const isStoreOwner: boolean = await checkStoreOwner(storeId, userId);
    if (!isStoreOwner) {
        res.status(403).json({ error: 'You must be the owner of the store!' });
        return;
    }

    const canUpdateShipping = await checkWhetherOrderCanUpdateShippingUnit(orderId);
    if (!canUpdateShipping) {
        res.status(403).json({ error: 'Shipping information cannot be updated for this order.' });
        return;
    }

    try {
        await updateShippingUnitForOrder(orderId, shipping_method);
        res.status(204).send();
    } catch (error) {
        console.error("Error updating shipping unit:", error);
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