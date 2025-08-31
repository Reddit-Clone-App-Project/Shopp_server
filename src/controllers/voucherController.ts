//! Voucher is different with normal discount
// It can be owned by a specific user

import { Request, Response } from "express";
import { getVoucherByUserId } from "../services/voucherService";

export const getAllUserVoucher = async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const limit = Number(req.query.limit) || 6;
    const offset = Number(req.query.offset) || 0;

    try {
        const vouchers = await getVoucherByUserId(userId, limit, offset);
        res.status(200).json(vouchers);
    } catch (error) {
        console.error("Error fetching vouchers:", error);
        res.status(500).json({ error: "Failed to fetch vouchers" });
    }
}