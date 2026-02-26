import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Paciente } from "../entities/Paciente";
import { TipoIdentificacion } from "../entities/TipoIdentificacion";

export class PacienteController {
    private pacienteRepository = AppDataSource.getRepository(Paciente);
    private tipoIdeRepository = AppDataSource.getRepository(TipoIdentificacion);

    // Validar formato de email
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Calcular nombre completo
    private formatFullName(p1: string, p2: string | null, a1: string, a2: string | null): string {
        return [p1, p2, a1, a2].filter(Boolean).join(" ");
    }

    // CREAR Paciente
    public async create(req: any, res: Response): Promise<Response> {
        /*
            #swagger.tags = ['Pacientes']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const { numero_identificacion, codigo_tipo_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email } = req.body;

            if (!numero_identificacion || !codigo_tipo_identificacion || !primer_nombre || !primer_apellido) {
                return res.status(400).json({ 
                    code: 400,
                    success: false,
                    message: "Validaciones requeridas faltantes. (numero_identificacion, codigo_tipo_identificacion, primer_nombre, primer_apellido)",
                    errorData: {}
                });
            }

            if (email && !this.isValidEmail(email)) {
                return res.status(400).json({ 
                    code: 400,
                    success: false,
                    message: "Formato de correo electrónico inválido.",
                    errorData: {}
                });
            }

            const tipoIdeEntities = await this.tipoIdeRepository.createQueryBuilder("t")
                .where("t.codigo_tipo_identificacion = :id", { id: codigo_tipo_identificacion })
                .getMany();
            const tipoIdeEntity = tipoIdeEntities.length > 0 ? tipoIdeEntities[0] : null;

            if (!tipoIdeEntity) {
                return res.status(400).json({ 
                    code: 400,
                    success: false,
                    message: "El tipo de identificación proporcionado no existe en base_datos.",
                    errorData: {}
                });
            }

            // Obtener el ID manualmente simulando la secuencia para compatibilidad estricta con Oracle 11g
            let nextId = 1;
            try {
                // Intentar sacar el MAX ID
                const maxIdResult = await this.pacienteRepository.query(`SELECT NVL(MAX("id_paciente"), 0) as MAXID FROM "mgm_pacientes"`);
                nextId = parseInt(maxIdResult[0].MAXID) + 1;
            } catch (ignored) {
                // Si falla (o no hay datos), empieza en 1.
            }

            // Crear y guardar
            const nuevoPaciente = new Paciente();
            nuevoPaciente.idPaciente = nextId; // Asignación manual del ID simulando incremento
            nuevoPaciente.numeroIdentificacion = numero_identificacion;
            nuevoPaciente.tipoIdentificacion = tipoIdeEntity;
            nuevoPaciente.primerNombre = primer_nombre;
            nuevoPaciente.segundoNombre = segundo_nombre || null;
            nuevoPaciente.primerApellido = primer_apellido;
            nuevoPaciente.segundoApellido = segundo_apellido || null;
            nuevoPaciente.nombreCompleto = this.formatFullName(primer_nombre, segundo_nombre, primer_apellido, segundo_apellido);
            nuevoPaciente.email = email || null;
            nuevoPaciente.usuarioIngreso = req.user?.username || "SISTEMA";

            await this.pacienteRepository.save(nuevoPaciente);

            return res.status(201).json({ 
                code: 201,
                success: true,
                message: "Paciente creado exitosamente", 
                data: nuevoPaciente 
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ 
                code: 500,
                success: false,
                message: "Error interno creando el paciente", 
                errorData: { detail: error.message }
            });
        }
    }

    // LISTAR Pacientes Paginados y Filtrables
    public async findAll(req: Request, res: Response): Promise<Response> {
        /*
            #swagger.tags = ['Pacientes']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const numeroIdentificacion = req.query.numero_identificacion as string;
            const nombreCompleto = req.query.nombre_completo as string;
            const email = req.query.email as string;
            const estado = req.query.estado as string || 'A'; // Defaults to A if not sent

            const queryBuilder = this.pacienteRepository.createQueryBuilder("paciente")
                .leftJoinAndSelect("paciente.tipoIdentificacion", "tipoIdentificacion");

            if (estado) {
                queryBuilder.andWhere("paciente.estado = :estado", { estado });
            }
            if (numeroIdentificacion) {
                queryBuilder.andWhere("paciente.numeroIdentificacion = :numeroIdentificacion", { numeroIdentificacion });
            }
            if (email) {
                queryBuilder.andWhere("paciente.email = :email", { email });
            }
            if (nombreCompleto) {
                queryBuilder.andWhere("LOWER(paciente.nombreCompleto) LIKE LOWER(:nombreCompleto)", { nombreCompleto: `%${nombreCompleto}%` });
            }

            const pacientes = await queryBuilder.getMany();
            const total = pacientes.length;
            const paginatedPacientes = pacientes.slice((page - 1) * limit, page * limit);

            return res.status(200).json({
                code: 200,
                success: true,
                message: "Pacientes obtenidos exitosamente",
                data: {
                    pacientes: paginatedPacientes,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ 
                code: 500,
                success: false,
                message: "Error obteniendo pacientes", 
                errorData: { detail: error.message }
            });
        }
    }

    // OBTENER Paciente por ID
    public async findOne(req: Request, res: Response): Promise<Response> {
        /*
            #swagger.tags = ['Pacientes']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const id = parseInt(req.params.id as string);
            const pacientes = await this.pacienteRepository.createQueryBuilder("paciente")
                .leftJoinAndSelect("paciente.tipoIdentificacion", "tipoIdentificacion")
                .where("paciente.idPaciente = :id", { id })
                .getMany();
            const paciente = pacientes.length > 0 ? pacientes[0] : null;

            if (!paciente) {
                return res.status(404).json({ 
                    code: 404,
                    success: false,
                    message: "Paciente no encontrado",
                    errorData: {}
                });
            }

            return res.status(200).json({ 
                code: 200,
                success: true,
                message: "Paciente obtenido exitosamente",
                data: paciente 
            });
        } catch (error: any) {
            return res.status(500).json({ 
                code: 500,
                success: false,
                message: "Error obteniendo el paciente",
                errorData: { detail: error.message }
            });
        }
    }

    // ACTUALIZAR Paciente
    public async update(req: any, res: Response): Promise<Response> {
        /*
            #swagger.tags = ['Pacientes']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const id = parseInt(req.params.id as string);
            const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email } = req.body;

            const pacientes = await this.pacienteRepository.createQueryBuilder("p")
                .where("p.idPaciente = :id", { id })
                .getMany();
            const paciente = pacientes.length > 0 ? pacientes[0] : null;

            if (!paciente) {
                return res.status(404).json({ 
                    code: 404,
                    success: false,
                    message: "Paciente no encontrado",
                    errorData: {}
                });
            }

            // Validar restricción clara: no se puede cambiar numero_ide ni tipo_ide
            if (req.body.numero_identificacion || req.body.codigo_tipo_identificacion) {
                return res.status(400).json({ 
                    code: 400,
                    success: false,
                    message: "No está permitido actualizar el número de identificación ni el tipo.",
                    errorData: {}
                });
            }

            if (email && !this.isValidEmail(email)) {
                return res.status(400).json({ 
                    code: 400,
                    success: false,
                    message: "Formato de correo electrónico inválido.",
                    errorData: {}
                });
            }

            // Actualizar campos
            if (primer_nombre) paciente.primerNombre = primer_nombre;
            if (segundo_nombre !== undefined) paciente.segundoNombre = segundo_nombre;
            if (primer_apellido) paciente.primerApellido = primer_apellido;
            if (segundo_apellido !== undefined) paciente.segundoApellido = segundo_apellido;
            if (email !== undefined) paciente.email = email;

            paciente.nombreCompleto = this.formatFullName(
                paciente.primerNombre,
                paciente.segundoNombre,
                paciente.primerApellido,
                paciente.segundoApellido
            );

            paciente.usuarioModificacion = req.user?.username || "SISTEMA";

            await this.pacienteRepository.save(paciente);
            return res.status(200).json({ 
                code: 200,
                success: true,
                message: "Paciente actualizado exitosamente", 
                data: paciente 
            });
        } catch (error: any) {
            return res.status(500).json({ 
                code: 500,
                success: false,
                message: "Error actualizando el paciente", 
                errorData: { detail: error.message }
            });
        }
    }

    // ELIMINAR Paciente (Baja Lógica)
    public async delete(req: any, res: Response): Promise<Response> {
        /*
            #swagger.tags = ['Pacientes']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const id = parseInt(req.params.id as string);
            const pacientes = await this.pacienteRepository.createQueryBuilder("p")
                .where("p.idPaciente = :id", { id })
                .andWhere("p.estado = :estado", { estado: 'A' })
                .getMany();
            const paciente = pacientes.length > 0 ? pacientes[0] : null;

            if (!paciente) {
                return res.status(404).json({ 
                    code: 404,
                    success: false,
                    message: "Paciente no encontrado o ya estaba inactivo",
                    errorData: {}
                });
            }

            // Baja lógica: actualizando estado de 'A' a 'I'
            paciente.estado = 'I';
            paciente.usuarioModificacion = req.user?.username || "SISTEMA";

            await this.pacienteRepository.save(paciente);

            return res.status(200).json({ 
                code: 200,
                success: true,
                message: "Paciente eliminado exitosamente (baja lógica)",
                data: {}
            });
        } catch (error: any) {
            return res.status(500).json({ 
                code: 500,
                success: false,
                message: "Error eliminando el paciente", 
                errorData: { detail: error.message }
            });
        }
    }
}
