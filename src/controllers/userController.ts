// !This file is an example and may not be functional without the rest of the application context.
import { Request, Response } from "express";
import { getAllUsers } from "../services/userService";

export const fetchUsers = async (req: Request, res: Response) => {
    try{
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({
            message: "An error occurred while fetching users",
        });
    }
}