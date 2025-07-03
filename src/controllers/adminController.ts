import { Request, Response } from "express";
import { Admin } from "../types/admin";
import { createAdmin, getAllUsers, getAdminById, deleteAdminById, updateAdminById } from "../services/adminService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { assignRefreshTokenToDBAdmin, removeRefreshTokenFromDBAdmin, validationAdmin, getAdminByRefreshToken } from "../services/authService";

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

export const registerAdmin = async (req: Request, res: Response) => {
  const { fullname, email, password, birthdate, emp_role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await createAdmin({
      fullname,
      email,
      password: hashedPassword,
      birthdate,
      role: emp_role || 'normal', // Default to 'normal' if not provided
    });
    res.status(201).json(newAdmin);
  } catch (err) {
    console.error("Error in the registration:", err);
    res.status(500).json({
      error: "Error in the registration",
    });
  }
};

export const getProfileAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (typeof req.user?.id !== "number"){
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const admin: Admin | undefined = await getAdminById(req.user?.id);

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const { password, refresh_token, ...adminSafe } = admin;
    res.status(200).json(adminSafe);
  } catch (err) {
    console.error("Error cannot get admin profile", err);
    res.status(500).json({ error: "Error cannot get admin profile" });
  }
};

export const updateProfileAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullname, birthdate, avatarImg } = req.body;

  try {
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const updatedAdmin = await updateAdminById({
      fullname,
      birthdate,
      avatarImg,
      adminId: req.user?.id,
    });

    if (!updatedAdmin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.status(200).json(updatedAdmin);
  } catch (err) {
    console.error("Error cannot update admin profile", err);
    res.status(500).json({ error: "Error cannot update admin profile" });
  }
};

export const deleteProfileAdmin = async (req: Request, res: Response) => {
  try {
    if (typeof req.user?.id !== "number") {
      res.status(400).json({ error: "Invalid or missing identifier" });
      return;
    }
    const deletedCount = await deleteAdminById(req.user?.id);

    if (deletedCount === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.status(200).json("Admin profile deleted successfully!");
  } catch (err) {
    console.error("Error cannot delete admin profile", err);
    res.status(500).json({ error: "Error cannot delete admin profile" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT secrets are not defined in environment variables");
    res.status(500).json({ error: "Internal server configuration error" });
    return;
  }

  try {
    const validationResult = await validationAdmin(email);

    if (!validationResult) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const { id, databasePassword } = validationResult;

    if (!databasePassword) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const isValid = await bcrypt.compare(String(password), String(databasePassword));

    if (!isValid) {
      res.status(401).json({ error: "Password is wrong" });
      return;
    }

    // Add JWT
    const accessToken = jwt.sign(
      { id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    assignRefreshTokenToDBAdmin(id, refreshToken);

    res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Admin cannot get verified", err);
    res.status(500).json({ error: "Admin cannot get verified" });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
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

      const foundAdmin = getAdminByRefreshToken(refreshToken);
      if (!foundAdmin) {
          res.clearCookie('jwt', { httpOnly: true });
          res.status(403).json({ message: 'Forbidden' });
          return;
      }
  
      // Delete the refresh token from the database
      await removeRefreshTokenFromDBAdmin(refreshToken);
      res.clearCookie('jwt', { httpOnly: true });
      res.status(200).json({ message: 'Admin logged out successfully' });
}