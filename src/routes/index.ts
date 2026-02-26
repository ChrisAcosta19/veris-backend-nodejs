import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { PacienteController } from "../controllers/paciente.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/database";

export const routes = Router();

const authController = new AuthController();
const pacienteController = new PacienteController();

// Auth Route
routes.post("/autenticacion/login",
    /* 
        #swagger.tags = ['Autenticación']
        #swagger.description = 'Endpoint para obtener el token JWT usando credenciales Basic Auth.'
        #swagger.security = [{ "basicAuth": [] }]
    */
    authController.login);

// Paciente CRUD Routes - Protegidas por Token JWT
routes.post("/pacientes",
    /* 
        #swagger.tags = ['Pacientes']
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: 'object',
                        properties: {
                            numero_identificacion: { type: 'string', example: '1765432109' },
                            codigo_tipo_identificacion: { type: 'string', example: 'CED' },
                            primer_nombre: { type: 'string', example: 'Sofia' },
                            segundo_nombre: { type: 'string', example: null },
                            primer_apellido: { type: 'string', example: 'Torres' },
                            segundo_apellido: { type: 'string', example: null },
                            email: { type: 'string', example: 'sofia.torres@test.com' }
                        },
                        required: ['numero_identificacion', 'codigo_tipo_identificacion', 'primer_nombre', 'primer_apellido']
                    }
                }
            }
        }
    */
    authMiddleware, pacienteController.create.bind(pacienteController));

routes.get("/pacientes",
    /* 
        #swagger.tags = ['Pacientes']
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Número de página (default: 1)',
            type: 'integer',
            example: 1
        }
        #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Cantidad de registros por página (default: 10)',
            type: 'integer',
            example: 10
        }
        #swagger.parameters['numero_identificacion'] = {
            in: 'query',
            description: 'Filtro por número de identificación (opcional)',
            type: 'string',
            example: '0912345678'
        }
        #swagger.parameters['nombre_completo'] = {
            in: 'query',
            description: 'Filtro por nombre completo - búsqueda parcial (opcional)',
            type: 'string',
            example: 'Pedro'
        }
        #swagger.parameters['email'] = {
            in: 'query',
            description: 'Filtro por email (opcional)',
            type: 'string',
            example: 'pedro@test.com'
        }
        #swagger.parameters['estado'] = {
            in: 'query',
            description: 'Filtro por estado: A (Activo) o I (Inactivo). Default: A',
            type: 'string',
            enum: ['A', 'I'],
            example: 'A'
        }
    */
    authMiddleware, pacienteController.findAll.bind(pacienteController));

routes.get("/pacientes/:id",
    /* 
        #swagger.tags = ['Pacientes']
        #swagger.security = [{ "bearerAuth": [] }]
    */
    authMiddleware, pacienteController.findOne.bind(pacienteController));

routes.put("/pacientes/:id",
    /* 
        #swagger.tags = ['Pacientes']
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: 'object',
                        properties: {
                            primer_nombre: { type: 'string', example: 'Juan' },
                            segundo_nombre: { type: 'string', example: 'Carlos' },
                            primer_apellido: { type: 'string', example: 'Pérez' },
                            segundo_apellido: { type: 'string', example: 'García' },
                            email: { type: 'string', example: 'nuevo.email@test.com' }
                        }
                    }
                }
            }
        }
    */
    authMiddleware, pacienteController.update.bind(pacienteController));

routes.delete("/pacientes/:id",
    /* 
        #swagger.tags = ['Pacientes']
        #swagger.security = [{ "bearerAuth": [] }]
    */
    authMiddleware, pacienteController.delete.bind(pacienteController));

// Endpoint temporal para ver qué tablas están en la BD Oracle remota
routes.get("/tablas", async (req, res) => {
    try {
        const tablas = await AppDataSource.query("SELECT table_name FROM user_tables");
        return res.status(200).json(
            { 
                code: 200,
                success: true,
                message: "Tablas obtenidas exitosamente",
                data: tablas
            }
        );
    } catch (e: any) {
        return res.status(500).json({ 
            code: 500,
            success: false,
            message: "Error obteniendo las tablas",
            errorData: { detail: e.message }
        });
    }
});
