import { Request, Response } from 'express';
import { sendOtpByEmail, verifyEmailOtp } from '../services/emailOtpService';
import { getUserById } from '../services/userService';

export const requestEmailOtp = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if(!userId){
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    try {
        const user = await getUserById(userId);
        if (!user || !user.email) {
            res.status(404).json({ error: 'User email not found' });
            return;
        }

        await sendOtpByEmail(userId, user.email);
        res.json({ message: 'OTP has been sent to your email.' });
    } catch(error){
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};


export const verifyUserWithOtp = async (req: Request, res: Response) => {
    const { otp } = req.body;
    const userId = req.user?.id;

    if(!userId){
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    const isValid = await verifyEmailOtp(userId, otp);

    if(isValid){
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Invalid OTP' });
    }
};
