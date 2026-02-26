# Veris Backend API (Node.js + Express + TypeORM + Oracle)
Este proyecto corresponde a la **API REST Backend para Gestión de Pacientes**. Construida sobre Node.js utilizando Express, TypeORM para el mapeo a base de datos Oracle, y TypeScript.

## Requisitos de Sistema
* **Node.js**: v16+
* **Oracle Database** con esquema activo.
* **IMPORTANTE**: Para conexiones a bases de datos antiguas o en nubes como CloudClusters (e.g. 11g XE), el cliente nativo de Node.js requiere activar el "Modo Thick". Para esto es indispensable descargar e instalar las librerías gratuitas de **Oracle Instant Client** en su máquina:
    1. Descargue el paquete "Basic Package" desde: [Oracle Instant Client for Windows x64](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html).
    2. Extraiga el `.zip` en un directorio permanente (ej. `C:\oracle\instantclient_21_12`).
    3. Agregue la ruta de esa carpeta extraída a su Variable de Entorno `PATH` de Windows.
    4. Reinicie su terminal o IDE para que los cambios surtan efecto.


## Instalación

1. Clone el repositorio e instale las dependencias:
```bash
npm install
```

2. Configure las variables de entorno para conectarse a Oracle de forma remota (ej: CloudClusters). Renombre `.env.example` a `.env` e ingrese los datos proveídos por su proveedor de nube:
```ini
DB_HOST=tu-host-de-cloudclusters.net
DB_PORT=1521
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SERVICE_NAME=tu_service_name
# DB_SID=tu_sid # Descomente y use en vez de DB_SERVICE_NAME si su proveedor entrega un SID
# DB_CONNECT_STRING=tu-host-de-cloudclusters.net:1521/tu_service_name # Opcional: usar cadena completa Easy Connect

JWT_SECRET=super_secret_veris_key
PORT=3000
```

**Descripción de parámetros `.env`**:
* `DB_HOST`: Dominio o IP pública provista por CloudClusters para la base de datos Oracle.
* `DB_PORT`: Puerto de conexión remota (típicamente 1521 o uno customizado en la nube).
* `DB_USER` / `DB_PASSWORD`: Credenciales de acceso de Oracle.
* `DB_SERVICE_NAME`: El Service Name lógico de la base de datos entregado por CloudClusters.
* `DB_SID`: Identificador del sistema (SID), úselo únicamente si CloudClusters no le provee un Service Name y pide forzosamente usar SID.
* `DB_CONNECT_STRING`: La cadena de conexión completa (TNS o Easy Connect). Si se provee, tiene más alta prioridad.
* `JWT_SECRET`: Llave secreta utilizada para la encriptación y validación de los tokens Bearer.
* `PORT`: Puerto en el que la API Express escuchará (por defecto 3000).

## Seed de Datos Básicos (Tipos de Identificación y Dummy Data)
El script de seed inicializa la base de datos con datos esenciales para que la API funcione correctamente. Este script inserta:

1. **Tipos de Identificación**: Tipos de documento que los pacientes pueden utilizar (Cédula, Pasaporte, RUC, etc.)
2. **Datos de Ejemplo**: Registros de pacientes dummy para pruebas

**Importante**: Este paso es **obligatorio** antes de usar la API en desarrollo. Ejecute:
```bash
npm run seed
```

El proceso es idempotente (seguro ejecutarlo múltiples veces) y mostrará un resumen de los datos insertados.

## Ejecución del Servidor
Para iniciar la API en modo desarrollo:
```bash
npm run dev
```
Para construir y correr en producción:
```bash
npm run build
npm start
```

## Documentación Interactiva (Swagger UI)
El proyecto incluye un script de autogeneración de documentación con `swagger-autogen` y `swagger-ui-express`.
Para acceder, asegúrese de arrancar el servidor de desarrollo local o productivo, y diríjase en su navegador web a:
```
http://localhost:3000/api-docs
```

## Flujo de Uso y Endpoints API

### 0. Consultar Tablas en la Base de Datos (Diagnóstico)
*Ideal para confirmar si TypeORM inicializó con éxito sus entidades en la base de datos vacía.*
**Linux/Mac**
```bash
curl -X GET http://localhost:3000/api/v1/tablas
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X GET http://localhost:3000/api/v1/tablas
```

### 1. Obtener Token (Login)
**Linux/Mac**
```bash
# Credenciales por defecto admin:veris123
curl -X POST http://localhost:3000/api/v1/autenticacion/login \
     -H "Authorization: Basic YWRtaW46dmVyaXMxMjM="
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X POST http://localhost:3000/api/v1/autenticacion/login ^
     -H "Authorization: Basic YWRtaW46dmVyaXMxMjM="
```
*(Respuesta incluye el JWT token Bearer)*. Utilice ese token en los headers de las siguientes peticiones.

### 2. Crear un Paciente
**Linux/Mac**
```bash
curl -X POST http://localhost:3000/api/v1/pacientes \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SU_TOKEN>" \
     -d '{
           "numero_identificacion": "1765432109",
           "codigo_tipo_identificacion": "CED",
           "primer_nombre": "Sofia",
           "primer_apellido": "Torres",
           "email": "sofia.torres@test.com"
         }'
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X POST http://localhost:3000/api/v1/pacientes ^
     -H "Content-Type: application/json" ^
     -H "Authorization: Bearer <SU_TOKEN>" ^
     -d "{\"numero_identificacion\": \"1765432109\", \"codigo_tipo_identificacion\": \"CED\", \"primer_nombre\": \"Sofia\", \"primer_apellido\": \"Torres\", \"email\": \"sofia.torres@test.com\"}"
```

### 3. Listar Pacientes Paginados (Con Filtros Opcionales)
**Linux/Mac**
```bash
# Sin filtros - traer todos los activos con paginación
curl -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=10" \
     -H "Authorization: Bearer <SU_TOKEN>"

# Con filtro de nombre
curl -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=10&nombre_completo=Sofia" \
     -H "Authorization: Bearer <SU_TOKEN>"

# Con múltiples filtros
curl -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=5&numero_identificacion=1765432109&estado=A" \
     -H "Authorization: Bearer <SU_TOKEN>"
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=10" ^
     -H "Authorization: Bearer <SU_TOKEN>"

curl.exe -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=10&nombre_completo=Sofia" ^
     -H "Authorization: Bearer <SU_TOKEN>"

curl.exe -X GET "http://localhost:3000/api/v1/pacientes?page=1&limit=5&numero_identificacion=1765432109&estado=A" ^
     -H "Authorization: Bearer <SU_TOKEN>"
```

### 4. Consultar Paciente por ID
**Linux/Mac**
```bash
curl -X GET "http://localhost:3000/api/v1/pacientes/1" \
     -H "Authorization: Bearer <SU_TOKEN>"
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X GET "http://localhost:3000/api/v1/pacientes/1" ^
     -H "Authorization: Bearer <SU_TOKEN>"
```

### 5. Actualizar Paciente (Email o Nombres)
**Linux/Mac**
```bash
# Actualizar solo email
curl -X PUT http://localhost:3000/api/v1/pacientes/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SU_TOKEN>" \
     -d '{
           "email": "nuevo.email@test.com"
         }'

# Actualizar nombres
curl -X PUT http://localhost:3000/api/v1/pacientes/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SU_TOKEN>" \
     -d '{
           "primer_nombre": "Juan",
           "segundo_nombre": "Pablo",
           "primer_apellido": "Castro",
           "segundo_apellido": "Ruiz",
           "email": "juan.castro@test.com"
         }'
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X PUT http://localhost:3000/api/v1/pacientes/1 ^
     -H "Content-Type: application/json" ^
     -H "Authorization: Bearer <SU_TOKEN>" ^
     -d "{\"email\": \"nuevo.email@test.com\"}"

curl.exe -X PUT http://localhost:3000/api/v1/pacientes/1 ^
     -H "Content-Type: application/json" ^
     -H "Authorization: Bearer <SU_TOKEN>" ^
     -d "{\"primer_nombre\": \"Juan\", \"segundo_nombre\": \"Pablo\", \"primer_apellido\": \"Castro\", \"segundo_apellido\": \"Ruiz\", \"email\": \"juan.castro@test.com\"}"
```

### 6. Eliminar Paciente (Baja Lógica)
**Linux/Mac**
```bash
curl -X DELETE "http://localhost:3000/api/v1/pacientes/1" \
     -H "Authorization: Bearer <SU_TOKEN>"
```

**Windows (CMD/PowerShell)**
```cmd
curl.exe -X DELETE "http://localhost:3000/api/v1/pacientes/1" ^
     -H "Authorization: Bearer <SU_TOKEN>"
```