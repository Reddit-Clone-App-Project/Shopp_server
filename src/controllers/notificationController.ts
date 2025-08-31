import { Request, Response } from "express";
import { createNotification, getNotificationsByUserId, markAllNotificationsAsRead, markNotificationAsRead, deleteNotification } from "../services/notificationService";

export const createANotification = async (req: Request, res: Response) => {
    if(typeof req.user?.id !== "number"){
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    const { title, content, type } = req.body;

    try {
        const newNotification = await createNotification({
            user_id: req.user.id,
            title,
            content,
            type
        });
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ error: "Failed to create notification" });
    }
};

export const getUserNotifications = async (req: Request, res: Response) => {
    if (typeof req.user?.id !== "number") {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    try {
        const notifications = await getNotificationsByUserId(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve notifications" });
    }
};

export const markAllUserNotificationAsRead = async (req: Request, res: Response) => {
    if (typeof req.user?.id !== "number") {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    try {
        await markAllNotificationsAsRead(req.user.id);
        res.status(200).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notifications as read" });
    }
};

export const markAUserNotificationAsRead = async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);

    try {
        await markNotificationAsRead(notificationId);
        res.status(200).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

export const deleteAUserNotification = async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);

    try {
        await deleteNotification(notificationId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};
