import swaggerAutogen from 'swagger-autogen';
import { config } from 'dotenv';
config();

const doc = {
    info: {
        title: 'Veris API',
        version: '1.0.0',
        description: 'API del Backend NodeJS para Veris (Prueba Técnica)',
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
            description: 'Servidor Local (Desarrollo)'
        }
    ],
    components: {
        securitySchemes: {
            basicAuth: {
                type: 'http',
                scheme: 'basic'
            },
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/routes/index.ts'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    // Generado con éxito
    console.log("Swagger UI documentation generated (OpenAPI 3.0).");
});
