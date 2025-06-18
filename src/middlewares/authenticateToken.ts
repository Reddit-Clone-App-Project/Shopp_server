import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/express';



export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.error("JWT secrets are not defined in environment variables");
        res.status(500).json({ error: "Internal server configuration error" });
        return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    };

    const token = authHeader.split(' ')[1];
    
    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
        req.user = decoded;
        next();

    }catch (err) {
        console.error('Token verification failed:', err);
        res.status(403).json({ error: "Forbidden: Invalid token" });
        return;
    };
};



