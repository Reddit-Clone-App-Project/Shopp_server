// !This file is an example and may not be functional without the rest of the application context.
import { Request, Response } from "express";
import { getAllUsers, createUser, getUserById, User, updateUserById, deleteUserById } from "../services/userService";
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


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);
  const { fullname, birthdate, avatarImg } = req.body;

  try {
    const updatedUser = await updateUserById({ fullname, birthdate, avatarImg, userId });
    
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(updatedUser)
  } catch (err) {
    console.error('Error cannot update user profile', err);
    res.status(500).json({ error: 'Error cannot update user profile' });
  }
};


export const deleteProfile = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  try {
    const deletedCount = await deleteUserById(userId);

    if (deletedCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json('User profile deleted succesfully!');
  } catch (err) {
    console.error('Error cannot delete user profile', err);
    res.status(500).json({ error: 'Error cannot delete user profile' });
  }
};