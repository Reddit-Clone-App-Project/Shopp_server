import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: No user found' });
            return;
        }

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this resource' });
            return;
        }

        next();
    };
};
