import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";

config();

export const AppDataSource = new DataSource({
    type: "oracle",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1521"),
    username: process.env.DB_USER || "system",
    password: process.env.DB_PASSWORD || "oracle",
    serviceName: process.env.DB_SERVICE_NAME || "ORCLCDB", // CloudClusters usualmente usa un Service Name
    sid: process.env.DB_SID, // O usar SID si aplica
    connectString: process.env.DB_CONNECT_STRING, // Opcional: Para usar la cadena TNS (Easy Connect) directa
    synchronize: false,
    logging: true,
    entities: [__dirname + "/../entities/*.{ts,js}"],
    migrations: [],
    subscribers: [],
});
