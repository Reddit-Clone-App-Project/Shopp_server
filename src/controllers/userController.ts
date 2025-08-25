import { Request, Response } from "express";
import pool from "../config/db";
import { User } from "../types/users";

import {
  assignRefreshTokenToDB,
  validationUser,
  getUserByRefreshToken,
  removeRefreshTokenFromDB,
} from "../services/authService";
import {
  createUser,
  updateUserById,
  deleteUserById,
  getUserById,
  getAddressesByUserId,
  addAddressByUserId,
  removeAddressById,
  updateAddressById,
  setAllIsDefaultFalse,
  setAddressIsDefaultTrue,
  updateUserAvatarById,
} from "../services/userService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import parsePhoneNumberFromString from "libphonenumber-js";
import { bucket } from "../config/gcs";

export const registerUser = async (req: Request, res: Response) => {
  const { email, phone_number, password, role } = req.body;
  const nationality: string | null =
    parsePhoneNumberFromString(phone_number)?.country ?? null;

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
  try {
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const user: User | undefined = await getUserById(req.user?.id);

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
  if (typeof req.user?.id !== "number") {
    res.status(400).json({ error: "Invalid or missing identifier" });
    return;
  }
  const { username, full_name, date_of_birth, gender } = req.body;

  try {
    const updatedUser = await updateUserById({
      username,
      fullname: full_name,
      birthdate: date_of_birth,
      userId: req.user?.id,
      gender,
    });

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password, refresh_token, ...userSafe } = updatedUser;

    res.status(200).json(userSafe);
  } catch (err) {
    console.error("Error cannot update user profile", err);
    res.status(500).json({ error: "Error cannot update user profile" });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "file required" });
      return;
    }

    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }

    const userId = req.user.id;
    const user = await getUserById(userId);

    if (user && user.profile_img) {
      const oldAvatarUrl = user.profile_img;
      const oldAvatarKey = oldAvatarUrl.split(`${bucket.name}/`)[1];
      await bucket.file(oldAvatarKey).delete();
    }

    const key = `avatar-images/${Date.now()}_${req.user?.id}.jpg`;
    const file = bucket.file(key);

    await file.save(req.file.buffer, {
      resumable: false,
      contentType: req.file.mimetype,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${key}`;

    const updateUser = await updateUserAvatarById(userId, publicUrl);

    const { password, refresh_token, ...userSafe } = updateUser;

    res.status(200).json(userSafe);
  } catch (error) {
    console.error("Error uploading avatar image:", error);
    res.status(500).json({ error: "Error uploading avatar image" });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const deletedCount = await deleteUserById(req.user?.id);

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
    const userValidationResult = await validationUser(eOrP);
    if (!userValidationResult || !userValidationResult.databasePassword) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { id, databasePassword, role } = userValidationResult;

    const isValid = await bcrypt.compare(
      String(password),
      String(databasePassword)
    );

    if (!isValid) {
      res.status(401).json({ error: "Password is wrong" });
      return;
    }

    // Add JWT
    const accessToken = jwt.sign(
      { id, role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id, role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    assignRefreshTokenToDB(id, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    }); // 1 day
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("User cannot get verified", err);
    res.status(500).json({ error: "User cannot get verified" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["jwt"];
  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token not found" });
    return;
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT secrets are not defined in environment variables");
    res.status(500).json({ error: "Internal server configuration error" });
    return;
  }

  const foundUser = getUserByRefreshToken(refreshToken);
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true });
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  // Delete the refresh token from the database
  await removeRefreshTokenFromDB(refreshToken);
  res.clearCookie("jwt", { httpOnly: true });
  res.status(200).json({ message: "User logged out successfully" });
};

/*
  ADDRESS
*/

export const getAddressesById = async (req: Request, res: Response) => {
  try {
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const addresses = await getAddressesByUserId(req.user?.id);

    if (!addresses) {
      res.status(404).json({ error: "Addresses not found" });
      return;
    }

    res.status(200).json(addresses);
  } catch (err) {
    console.error("Error cannot get user address", err);
    res.status(500).json({ error: "Error cannot get user address" });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  const client = await pool.connect();
  const {
    full_name,
    address_line1,
    address_line2,
    city,
    province,
    postal_code,
    country,
    phone_number,
    is_default,
  } = req.body;
  try {
    await client.query("BEGIN");
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }

    if (is_default === true) {
      await setAllIsDefaultFalse(req.user.id);
    }

    const newAddress = await addAddressByUserId({
      full_name,
      address_line1,
      address_line2,
      city,
      province,
      postal_code,
      country,
      phone_number,
      is_default,
      id: req.user.id,
    });
    if (!newAddress) {
      res.status(500).json({ error: "Error cannot add user address" });
      return;
    }

    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const addresses = await getAddressesByUserId(req.user?.id);

    if (!addresses) {
      res.status(404).json({ error: "Addresses not found" });
      return;
    }

    res.status(201).json(addresses);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error cannot add user address", err);
    res.status(500).json({ error: "Error cannot add user address" });
  } finally {
    client.release();
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const {
      full_name,
      address_line1,
      address_line2,
      city,
      province,
      postal_code,
      country,
      phone_number,
    } = req.body;

    const updatedAddress = await updateAddressById({
      address_id: parseInt(req.params.id),
      full_name,
      address_line1,
      address_line2,
      city,
      province,
      postal_code,
      country,
      phone_number,
    });

    if (!updatedAddress) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const addresses = await getAddressesByUserId(req.user?.id);

    if (!addresses) {
      res.status(404).json({ error: "Addresses not found" });
      return;
    }

    res.status(200).json(addresses);
  } catch (err) {
    console.error("Error cannot update user address", err);
    res.status(500).json({ error: "Error cannot update user address" });
  }
};

export const removeAnAddress = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }

    await removeAddressById(parseInt(req.params.id));
    res.status(200).json({ id: parseInt(req.params.id) });
  } catch (err) {
    console.error("Error cannot delete user address", err);
    res.status(500).json({ error: "Error cannot delete user address" });
  }
};

export const setAddressIsDefaultToTrue = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (!req.params.id) {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }

    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }

    await setAllIsDefaultFalse(req.user.id);
    await setAddressIsDefaultTrue(parseInt(req.params.id));
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const addresses = await getAddressesByUserId(req.user?.id);

    if (!addresses) {
      res.status(404).json({ error: "Addresses not found" });
      return;
    }

    res.status(200).json(addresses);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error cannot set address as default", err);
    res.status(500).json({ error: "Error cannot set address as default" });
  } finally {
    client.release();
  }
};
