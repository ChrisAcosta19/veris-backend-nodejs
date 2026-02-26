import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export class AuthController {
    public async login(req: Request, res: Response) {
        /*
            #swagger.tags = ['Autenticación']
            #swagger.description = 'Endpoint para obtener el token JWT usando credenciales Basic Auth.'
            #swagger.security = [{
                "basicAuth": []
            }]
        */
        // Obtenemos los headers de autenticación básica
        const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
        const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

        // Hardcoding credentials as it is a technical test requirement placeholder
        if (login === "admin" && password === "veris123") {
            const secret = process.env.JWT_SECRET || "default_secret";
            // Emit JWT token
            const token = jwt.sign({ username: login, role: "admin" }, secret, {
                expiresIn: "1h",
            });
            return res.status(200).json({ 
                code: 200,
                success: true,
                message: "Authentication successful",
                data: { token, type: "Bearer", expiresIn: 3600 }
            });
        }

        return res.status(401).json({ 
            code: 401,
            success: false,
            message: "Authentication failed. Invalid username or password.",
            errorData: {}
        });
    }
}
