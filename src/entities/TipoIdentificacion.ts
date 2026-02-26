import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("daf_tipos_identificacion")
export class TipoIdentificacion {

    @PrimaryColumn({ name: "codigo_tipo_identificacion", type: "varchar2", length: 3 })
    codigoTipoIdentificacion: string;

    @Column({ name: "nombre_tipo_identificacion", type: "varchar2", length: 100 })
    nombreTipoIdentificacion: string;

    @Column({ name: "estado", type: "varchar2", length: 1, default: "A" })
    estado: string;
}
