import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUserByRefreshToken } from '../services/authService';

export const handleRefreshToken = (req: Request, res: Response) : void => {
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
        res.status(403).json({ message: 'Forbidden' });
        return;
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ error: 'Invalid refresh token' });
                return;
            }

        const newAccessToken = jwt.sign({ email: decoded.email }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
}
