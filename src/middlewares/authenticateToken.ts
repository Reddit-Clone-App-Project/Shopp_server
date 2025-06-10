//! While this code is functional, the type of request is not properly defined, as also the err and decoded
//! We need to look through the code and fix the types
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("JWT secrets are not defined in environment variables");
        res.status(500).json({ error: "Internal server configuration error" });
        return;
    }
    try{
        const authHeader = req.headers['authorization'];
        if(!authHeader) throw new Error('Unauthorized');
        console.log(authHeader); //Bearer token
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string,
            (err: any, decoded: any) => {
                if (err) throw new Error("Forbidden"); //invalid token
                req.email = decoded.email;
                next();
            }
        );
    }catch (error) {
        next(error);
    }
};


