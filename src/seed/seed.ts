import { AppDataSource } from "../config/database";
import { TipoIdentificacion } from "../entities/TipoIdentificacion";
import { Paciente } from "../entities/Paciente";
import oracledb from "oracledb";

try {
    oracledb.initOracleClient();
} catch (err) {
    console.log("Oracle Thick Mode Init Warn:", err);
}

const runSeed = async () => {
    try {
        AppDataSource.setOptions({ synchronize: true, dropSchema: true });
        await AppDataSource.initialize();
        console.log("Database connected. Starting seeding...");

        const tipoIdeRepo = AppDataSource.getRepository(TipoIdentificacion);
        const pacienteRepo = AppDataSource.getRepository(Paciente);

        // 1. Seed Tipos Identificación
        const tipos = [
            { codigoTipoIdentificacion: "CED", nombreTipoIdentificacion: "Cédula de Ciudadanía" },
            { codigoTipoIdentificacion: "RUC", nombreTipoIdentificacion: "Registro Único de Contribuyentes" },
            { codigoTipoIdentificacion: "PAS", nombreTipoIdentificacion: "Pasaporte" },
        ];

        for (const tipo of tipos) {
            const exists = await tipoIdeRepo.createQueryBuilder("t")
                .where("t.codigo_tipo_identificacion = :id", { id: tipo.codigoTipoIdentificacion })
                .getMany();

            if (exists.length === 0) {
                const newTipo = tipoIdeRepo.create(tipo);
                await tipoIdeRepo.save(newTipo);
            }
        }
        console.log("Tipos de identificación creados.");

        // 2. Fetch CED to use on dummy pacientes
        const cedList = await tipoIdeRepo.createQueryBuilder("t")
            .where("t.codigo_tipo_identificacion = :id", { id: "CED" })
            .getMany();
        const ced = cedList.length > 0 ? cedList[0] : null;

        if (ced) {
            // Check if dummy patients already exist to avoid duplicating
            const existPatients = await pacienteRepo.count();
            if (existPatients === 0) {
                const pacientes = [
                    {
                        numeroIdentificacion: "1712345678",
                        tipoIdentificacion: ced,
                        primerNombre: "Juan",
                        segundoNombre: "Carlos",
                        primerApellido: "Perez",
                        segundoApellido: "Sanchez",
                        nombreCompleto: "Juan Carlos Perez Sanchez",
                        email: "juan.perez@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1798765432",
                        tipoIdentificacion: ced,
                        primerNombre: "Ana",
                        segundoNombre: "Maria",
                        primerApellido: "Gomez",
                        segundoApellido: "López",
                        nombreCompleto: "Ana Maria Gomez López",
                        email: "ana.gomez@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1756234890",
                        tipoIdentificacion: ced,
                        primerNombre: "Pedro",
                        segundoNombre: null,
                        primerApellido: "Lopez",
                        segundoApellido: "Rivera",
                        nombreCompleto: "Pedro Lopez Rivera",
                        email: "pedro.lopez@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1734567890",
                        tipoIdentificacion: ced,
                        primerNombre: "Maria",
                        segundoNombre: "Elena",
                        primerApellido: "Garcia",
                        segundoApellido: "Martinez",
                        nombreCompleto: "Maria Elena Garcia Martinez",
                        email: "maria.garcia@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1789654321",
                        tipoIdentificacion: ced,
                        primerNombre: "Carlos",
                        segundoNombre: "Antonio",
                        primerApellido: "Rodriguez",
                        segundoApellido: "Flores",
                        nombreCompleto: "Carlos Antonio Rodriguez Flores",
                        email: "carlos.rodriguez@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1712389456",
                        tipoIdentificacion: ced,
                        primerNombre: "Patricia",
                        segundoNombre: "Guadalupe",
                        primerApellido: "Hernandez",
                        segundoApellido: "Castro",
                        nombreCompleto: "Patricia Guadalupe Hernandez Castro",
                        email: "patricia.hernandez@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1745678123",
                        tipoIdentificacion: ced,
                        primerNombre: "Luis",
                        segundoNombre: "Miguel",
                        primerApellido: "Diaz",
                        segundoApellido: "Vargas",
                        nombreCompleto: "Luis Miguel Diaz Vargas",
                        email: "luis.diaz@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1798456789",
                        tipoIdentificacion: ced,
                        primerNombre: "Rosa",
                        segundoNombre: "Isabel",
                        primerApellido: "Morales",
                        segundoApellido: "Gutierrez",
                        nombreCompleto: "Rosa Isabel Morales Gutierrez",
                        email: "rosa.morales@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1723456789",
                        tipoIdentificacion: ced,
                        primerNombre: "Diego",
                        segundoNombre: null,
                        primerApellido: "Ortega",
                        segundoApellido: "Soto",
                        nombreCompleto: "Diego Ortega Soto",
                        email: "diego.ortega@example.com",
                        estado: "A",
                        usuarioIngreso: "SEED_SCRIPT"
                    },
                    {
                        numeroIdentificacion: "1767890123",
                        tipoIdentificacion: ced,
                        primerNombre: "Sandra",
                        segundoNombre: "Beatriz",
                        primerApellido: "Chavez",
                        segundoApellido: "Mendoza",
                        nombreCompleto: "Sandra Beatriz Chavez Mendoza",
                        email: "sandra.chavez@example.com",
                        estado: "I",
                        usuarioIngreso: "SEED_SCRIPT"
                    }
                ];

                let nextId = 1;
                try {
                    const maxIdResult = await pacienteRepo.query(`SELECT NVL(MAX("id_paciente"), 0) as MAXID FROM "mgm_pacientes"`);
                    nextId = parseInt(maxIdResult[0].MAXID) + 1;
                } catch (ignored) { }

                for (const pac of pacientes) {
                    const newPac = pacienteRepo.create(pac);
                    newPac.idPaciente = nextId++;
                    await pacienteRepo.save(newPac);
                }
                console.log("10 pacientes dummy (semilla) creados exitosamente.");
            } else {
                console.log("La tabla de pacientes ya contiene registros. Omitiendo la creación de Dummies.");
            }
        }

        console.log("Seeding completado exitosamente.");
    } catch (e) {
        console.error("Error durante el seeding process:", e);
    } finally {
        await AppDataSource.destroy();
        process.exit();
    }
};

runSeed();
