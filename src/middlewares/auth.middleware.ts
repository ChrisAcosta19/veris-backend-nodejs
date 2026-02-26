import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            code: 401,
            success: false,
            message: "No token provided, Bearer token required",
            errorData: {}
        });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default_secret";

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ 
            code: 403,
            success: false,
            message: "Invalid or expired token",
            errorData: {}
        });
    }
};
