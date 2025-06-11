import { Request, Response } from "express";
import { Storage } from "../types/admin";
import { createStorage, getStorageById, updateStorageById, deleteStorageById } from "../services/storageService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { assignRefreshTokenToDBStorage, removeRefreshTokenFromDBStorage, validationStorage, getStorageByRefreshToken } from "../services/authService";

export const registerStorage = async (req: Request, res: Response) => {
  const { email, password, shipping_unit, location } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStorage = await createStorage({
      email,
      password: hashedPassword,
      shipping_unit,
      location
    });
    res.status(201).json(newStorage);
  } catch (err) {
    console.error("Error in the registration:", err);
    res.status(500).json({
      error: "Error in the registration",
    });
  }
};

export const getProfileStorage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const storageId = Number(req.params.id);
  

  try {
    const storage: Storage | undefined = await getStorageById(storageId);

    if (!storage) {
      res.status(404).json({ error: "Storage not found" });
      return;
    }

    const { password, refresh_token, ...storageSafe } = storage;
    res.status(200).json(storageSafe);
  } catch (err) {
    console.error("Error cannot get storage profile", err);
    res.status(500).json({ error: "Error cannot get storage profile" });
  }
};

export const updateProfileStorage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const storageId = Number(req.params.id);
  const { email, location } = req.body;

  try {
    const updatedStorage = await updateStorageById({
      email,
      location,
      storageId,
    });

    if (!updatedStorage) {
      res.status(404).json({ error: "Storage not found" });
      return;
    }

    res.status(200).json(updatedStorage);
  } catch (err) {
    console.error("Error cannot update storage profile", err);
    res.status(500).json({ error: "Error cannot update storage profile" });
  }
};

export const deleteProfileStorage = async (req: Request, res: Response) => {
  const storageId = Number(req.params.id);

  try {
    const deletedCount = await deleteStorageById(storageId);

    if (deletedCount === 0) {
      res.status(404).json({ error: "Storage not found" });
      return;
    }

    res.status(200).json("Storage profile deleted successfully!");
  } catch (err) {
    console.error("Error cannot delete storage profile", err);
    res.status(500).json({ error: "Error cannot delete storage profile" });
  }
};

export const loginStorage = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT secrets are not defined in environment variables");
    res.status(500).json({ error: "Internal server configuration error" });
    return;
  }

  try {
    const databasePassword = await validationStorage(email);

    if (!databasePassword) {
      res.status(404).json({ error: "Storage not found" });
      return;
    }

    const isValid = await bcrypt.compare(password, databasePassword);

    if (!isValid) {
      res.status(401).json({ error: "Password is wrong" });
      return;
    }

    // Add JWT
    const accessToken = jwt.sign(
      { email },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email, role: "storage" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    assignRefreshTokenToDBStorage(email, refreshToken);

    res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Storage cannot get verified", err);
    res.status(500).json({ error: "Storage cannot get verified" });
  }
};

export const logoutStorage = async (req: Request, res: Response) => {
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

      const foundStorage = getStorageByRefreshToken(refreshToken);
      if (!foundStorage) {
          res.clearCookie('jwt', { httpOnly: true });
          res.status(403).json({ message: 'Forbidden' });
          return;
      }
  
      // Delete the refresh token from the database
      await removeRefreshTokenFromDBStorage(refreshToken);
      res.clearCookie('jwt', { httpOnly: true });
      res.status(200).json({ message: 'Storage logged out successfully' });
}