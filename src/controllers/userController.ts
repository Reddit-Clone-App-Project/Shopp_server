// !This file is an example and may not be functional without the rest of the application context.
import { Request, Response } from "express";
import { getAllUsers } from "../services/userService";
import { createUser } from "../services/userService";
import { getUserById, User} from '../services/userService';
import bcrypt from 'bcrypt';

export const fetchUsers = async (req: Request, res: Response) => {
    try{
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({
            message: "An error occurred while fetching users",
        });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    const { fullname, email, password, role, birthdate } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser ({ fullname, email, password: hashedPassword, role, birthdate });
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error in the registration:', err);
        res.status(500).json({ 
            error: 'Error in the registration' 
        });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  try {
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password, ...userSafe } = user;
    res.status(200).json(userSafe);
  } catch (err) {
    console.error('Error cannot get user profile', err);
    res.status(500).json({ error: 'Error cannot get user profile' });
  }
};