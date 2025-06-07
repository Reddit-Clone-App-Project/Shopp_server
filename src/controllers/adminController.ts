import { Request, Response } from "express";
import { getAllUsers } from "../services/adminService";

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({
      message: "An error occurred while fetching users",
    });
  }
};