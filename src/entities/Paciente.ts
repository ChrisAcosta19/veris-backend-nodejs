import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TipoIdentificacion } from "./TipoIdentificacion";

@Entity("mgm_pacientes")
export class Paciente {

    @PrimaryColumn("number", { name: "id_paciente" })
    idPaciente: number;

    @ManyToOne(() => TipoIdentificacion)
    @JoinColumn({ name: "codigo_tipo_identificacion" })
    tipoIdentificacion: TipoIdentificacion;

    @Column({ name: "numero_identificacion", type: "varchar2", length: 20 })
    numeroIdentificacion: string;

    @Column({ name: "primer_nombre", type: "varchar2", length: 50 })
    primerNombre: string;

    @Column({ name: "segundo_nombre", type: "varchar2", length: 50, nullable: true })
    segundoNombre: string;

    @Column({ name: "primer_apellido", type: "varchar2", length: 50 })
    primerApellido: string;

    @Column({ name: "segundo_apellido", type: "varchar2", length: 50, nullable: true })
    segundoApellido: string;

    @Column({ name: "nombre_completo", type: "varchar2", length: 200 })
    nombreCompleto: string;

    @Column({ name: "email", type: "varchar2", length: 100, nullable: true })
    email: string;

    @Column({ name: "estado", type: "varchar2", length: 1, default: "A" })
    estado: string; // 'A' = Activo, 'I' = Inactivo

    @CreateDateColumn({ name: "fecha_ingreso", type: "timestamp" })
    fechaIngreso: Date;

    @Column({ name: "usuario_ingreso", type: "varchar2", length: 50, nullable: true })
    usuarioIngreso: string;

    @UpdateDateColumn({ name: "fecha_modificacion", type: "timestamp" })
    fechaModificacion: Date;

    @Column({ name: "usuario_modificacion", type: "varchar2", length: 50, nullable: true })
    usuarioModificacion: string;
}
