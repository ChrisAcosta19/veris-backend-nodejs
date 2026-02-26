import express from "express";
import cors from "cors";
import { routes } from "./routes";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Leer archivo de swagger generado
const swaggerFile = path.join(__dirname, 'swagger_output.json');
if (fs.existsSync(swaggerFile)) {
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Main Router Prefix
app.use("/api/v1", routes);

export default app;
