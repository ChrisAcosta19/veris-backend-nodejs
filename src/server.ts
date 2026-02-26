import app from "./app";
import { AppDataSource } from "./config/database";
import oracledb from "oracledb";

try {
    // Intentar activar el modo "Thick" de Oracle que soporta dbs más antiguas (e.g. 11g)
    oracledb.initOracleClient();
} catch (err) {
    console.error("No se pudo inicializar Oracle Thick Mode (verifique que el cliente esté en el PATH):", err);
}

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Conectado exitosamente a la base de datos Oracle a través de TypeORM.");

        app.listen(PORT, () => {
            console.log(`Servidor Express corriendo en el puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error conectando a la base de datos:", error);
    });
