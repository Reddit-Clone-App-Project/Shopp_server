import rateLimit from 'express-rate-limit';


export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Too many requests, try again in 5 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});