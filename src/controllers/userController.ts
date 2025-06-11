import { Request, Response } from "express";
import { User } from "../types/users";
import {
  assignRefreshTokenToDB,
  validationUser,
  getUserByRefreshToken,
  removeRefreshTokenFromDB,
} from "../services/authService";
import {
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../services/userService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import parsePhoneNumberFromString from "libphonenumber-js";

export const registerUser = async (req: Request, res: Response) => {
  const { email, phone_number, password, role } = req.body;
  const nationality: string | null = parsePhoneNumberFromString(phone_number)?.country ?? null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      email,
      phone_number,
      password: hashedPassword,
      role,
      nationality,
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error in the registration:", err);
    res.status(500).json({
      error: "Error in the registration",
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.params.id);
  

  try {
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password, refresh_token, ...userSafe } = user;
    res.status(200).json(userSafe);
  } catch (err) {
    console.error("Error cannot get user profile", err);
    res.status(500).json({ error: "Error cannot get user profile" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.params.id);
  const { fullname, phone_number, birthdate, avatarImg } = req.body;
  const nationality: string | null = parsePhoneNumberFromString(phone_number)?.country ?? null;

  try {
    const updatedUser = await updateUserById({
      fullname,
      nationality,
      phone_number,
      birthdate,
      avatarImg,
      userId,
    });

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error cannot update user profile", err);
    res.status(500).json({ error: "Error cannot update user profile" });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  try {
    const deletedCount = await deleteUserById(userId);

    if (deletedCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json("User profile deleted successfully!");
  } catch (err) {
    console.error("Error cannot delete user profile", err);
    res.status(500).json({ error: "Error cannot delete user profile" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { eOrP, password } = req.body;

  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT secrets are not defined in environment variables");
    res.status(500).json({ error: "Internal server configuration error" });
    return;
  }

  try {
    const databasePassword = await validationUser(eOrP);
    if (!databasePassword) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isValid = await bcrypt.compare(password, databasePassword);

    if (!isValid) {
      res.status(401).json({ error: "Password is wrong" });
      return;
    }

    // Add JWT
    const accessToken = jwt.sign(
      { eOrP },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { eOrP, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    assignRefreshTokenToDB(eOrP, refreshToken);

    res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("User cannot get verified", err);
    res.status(500).json({ error: "User cannot get verified" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies['jwt'];
      if (!refreshToken) {
          res.status(401).json({ error: 'Refresh token not found' });
          return;
      }
  
      if (!process.env.REFRESH_TOKEN_SECRET) {
          console.error("JWT secrets are not defined in environment variables");
          res.status(500).json({ error: "Internal server configuration error" });
          return;
      }
  
      const foundUser = getUserByRefreshToken(refreshToken);
      if (!foundUser) {
          res.clearCookie('jwt', { httpOnly: true });
          res.status(403).json({ message: 'Forbidden' });
          return;
      }
  
      // Delete the refresh token from the database
      await removeRefreshTokenFromDB(refreshToken);
      res.clearCookie('jwt', { httpOnly: true });
      res.status(200).json({ message: 'User logged out successfully' });
}
