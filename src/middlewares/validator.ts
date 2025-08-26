import { Request, Response, NextFunction } from "express";
import validator from 'validator';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { email, phone_number, password } = req.body;

    if (!email || !phone_number || !password) {
        res.status(400).json({ error: 'Email, phone number, and password are required' });
        return;
    }

    // Sanitize the phone number by removing spaces, dashes, and parentheses before validation
    const sanitizedPhoneNumber = String(phone_number).replace(/[\s-()]/g, '');

    if (!validator.isEmail(email)) {
        res.status(400).json({ error: 'Email is not valid' });
        return;
    }

    if (!validator.isMobilePhone(sanitizedPhoneNumber)) {
        res.status(400).json({ error: 'Phone number is not valid' });
        return;
    }

    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        res.status(400).json({
            error: 'Password is weak. It must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one symbol.'
        });
        return;
    }
    
    // Normalize and sanitize the inputs on the request body for the next middleware/controller
    req.body.email = validator.normalizeEmail(email);

    next();
};

// export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
//     const { eOrP, password} = req.body;

//     if (!eOrP || !password) {
//         res.status(400).json({ error: 'Email/Phone and password are required' });
//         return;
//     };

//     let email: string | undefined;
//     let phone_number: string | undefined;

//     if (validator.isEmail(eOrP)) {
//         email = validator.normalizeEmail(eOrP) || undefined;
//     } else if (validator.isMobilePhone(eOrP, 'any')) {
//         phone_number = eOrP;
//     } else {
//         res.status(400).json({ error: 'Invalid email or phone number format'});
//         return;
//     };

//     if (!email && !phone_number) {
//         res.status(400).json({ error: 'Email or phone number required'});
//         return;
//     }

//     if (email && !validator.isEmail(email)) {
//         res.status(400).json({ error: 'Email is not valid' });
//         return;
//     };

//     if (!password || typeof password !== 'string' || validator.isEmpty(password) || !validator.isLength(password, { min: 8, max: 30})) {
//         res.status(400).json({ error: 'Password is not valid' });
//         return;
//     };

//     if (phone_number && !validator.isMobilePhone(phone_number, 'any')) {
//         res.status(400).json({ error: 'Phone number is not valid' });
//         return;
//     };

//     next();
// };