import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUserByRefreshToken, getAdminByRefreshToken, getShipperByRefreshToken, getStorageByRefreshToken } from '../services/authService';

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

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ error: 'Invalid refresh token' });
                return;
            }
        
            const role = decoded.role;
           
            if (role === 'user'){
                const foundUser = getUserByRefreshToken(refreshToken);
                if (!foundUser) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
            }else if (role === 'admin'){
                const foundAdmin = getAdminByRefreshToken(refreshToken);
                if (!foundAdmin) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
            }else if (role === 'shipper'){
                const foundShipper = getShipperByRefreshToken(refreshToken);
                if (!foundShipper) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
            }else if (role === 'storage'){
                const foundStorage = getStorageByRefreshToken(refreshToken);
                if (!foundStorage) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
            }

            const newAccessToken = jwt.sign({ id: decoded.id, eOrP: decoded.eOrP }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
            res.json({ accessToken: newAccessToken });
    });
}
