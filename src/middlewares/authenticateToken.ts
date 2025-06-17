import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include eOrP
declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: number;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("JWT secrets are not defined in environment variables");
        res.status(500).json({ error: "Internal server configuration error" });
        return;
    }
    try{
        const authHeader = req.headers['authorization'];
        if(!authHeader) throw new Error('Unauthorized');
        
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string,
            (err: any, decoded: any) => {
                if (err) throw new Error("Forbidden"); //invalid token
                req.user = decoded;
                next();
            }
        );
    }catch (error) {
        next(error);
    }
};


