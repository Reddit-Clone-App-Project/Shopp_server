import { Request, Response, NextFunction } from "express";
import validator from 'validator';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, phone_number } = req.body;

    if (!email || !validator.isEmail(email)) {
        res.status(400).json({ error: 'Email is not valid' });
        return;
    };

    if (!password || !validator.isLength(password, {min: 8, max: 30}) || !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        res.status(400).json({ error: 'Password is weak, it must have al least 8 characters, both lower and uppercase letter 1 number and 1 simbol'});
        return;
    };

    if (!phone_number || !validator.isMobilePhone(phone_number, 'any')) {
        res.status(400).json({ error: 'Phone number is not valid' });
        return;
    };

    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, phone_number} = req.body;

    if (!email && !phone_number) {
        res.status(400).json({ error: 'Email or phone number required'});
        return;
    }

    if (email && !validator.isEmail(email)) {
        res.status(400).json({ error: 'Email is not valid' });
        return;
    };

    if (!password || typeof password !== 'string' || validator.isEmpty(password) || !validator.isLength(password, { min: 8, max: 30})) {
        res.status(400).json({ error: 'Password is not valid' });
        return;
    };

    if (phone_number && !validator.isMobilePhone(phone_number, 'any')) {
        res.status(400).json({ error: 'Phone number is not valid' });
        return;
    };

    next();
};