import { Request, Response } from "express";
import { Shipper } from "../types/admin";
import { createShipper, getShipperById, updateShipperById, deleteShipperById } from "../services/shipperService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { assignRefreshTokenToDBShipper, removeRefreshTokenFromDBShipper, validationShipper, getShipperByRefreshToken } from "../services/authService";

export const registerShipper = async (req: Request, res: Response) => {
  const { fullname, email, password, birthdate, shipping_unit,  storage_id} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newShipper = await createShipper({
      fullname,
      email,
      password: hashedPassword,
      birthdate,
      shipping_unit,
      storage_id
    });
    res.status(201).json(newShipper);
  } catch (err) {
    console.error("Error in the registration:", err);
    res.status(500).json({
      error: "Error in the registration",
    });
  }
};

export const getProfileShipper = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (typeof req.user?.id !== "number"){
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const shipper: Shipper | undefined = await getShipperById(req.user?.id);

    if (!shipper) {
      res.status(404).json({ error: "Shipper not found" });
      return;
    }

    const { password, refresh_token, ...shipperSafe } = shipper;
    res.status(200).json(shipperSafe);
  } catch (err) {
    console.error("Error cannot get shipper profile", err);
    res.status(500).json({ error: "Error cannot get shipper profile" });
  }
};

export const updateProfileShipper = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullname, birthdate, avatarImg } = req.body;

  try {
    if (typeof req.user?.id !== "number"){
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const updatedShipper = await updateShipperById({
      fullname,
      birthdate,
      avatarImg,
      shipperId : req.user?.id,
    });

    if (!updatedShipper) {
      res.status(404).json({ error: "Shipper not found" });
      return;
    }

    res.status(200).json(updatedShipper);
  } catch (err) {
    console.error("Error cannot update shipper profile", err);
    res.status(500).json({ error: "Error cannot update shipper profile" });
  }
};

export const deleteProfileShipper = async (req: Request, res: Response) => {
  try {
    if (typeof req.user?.id !== "number"){
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const deletedCount = await deleteShipperById(req.user?.id);

    if (deletedCount === 0) {
      res.status(404).json({ error: "Shipper not found" });
      return;
    }

    res.status(200).json("Shipper profile deleted successfully!");
  } catch (err) {
    console.error("Error cannot delete shipper profile", err);
    res.status(500).json({ error: "Error cannot delete shipper profile" });
  }
};

export const loginShipper = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT secrets are not defined in environment variables");
    res.status(500).json({ error: "Internal server configuration error" });
    return;
  }

  try {
    const validationResult = await validationShipper(email);

    if (!validationResult) {
      res.status(404).json({ error: "Shipper not found" });
      return;
    }

    const { id, databasePassword } = validationResult;

    if (!databasePassword) {
      res.status(404).json({ error: "Shipper not found" });
      return;
    }

    const isValid = await bcrypt.compare(String(password), String(databasePassword));

    if (!isValid) {
      res.status(401).json({ error: "Password is wrong" });
      return;
    }

    // Add JWT
    const accessToken = jwt.sign(
      { id, role: "shipper" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id, role: "shipper" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    assignRefreshTokenToDBShipper(id, refreshToken);

    res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Shipper cannot get verified", err);
    res.status(500).json({ error: "Shipper cannot get verified" });
  }
};

export const logoutShipper = async (req: Request, res: Response) => {
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

      const foundShipper = getShipperByRefreshToken(refreshToken);
      if (!foundShipper) {
          res.clearCookie('jwt', { httpOnly: true });
          res.status(403).json({ message: 'Forbidden' });
          return;
      }
  
      // Delete the refresh token from the database
      await removeRefreshTokenFromDBShipper(refreshToken);
      res.clearCookie('jwt', { httpOnly: true });
      res.status(200).json({ message: 'Shipper logged out successfully' });
}