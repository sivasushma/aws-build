import swaggerJSDoc from 'swagger-jsdoc';
import config from 'config';

const swaggerDefinition = {
  info: {
    title: 'PWC Startup Db Users Management Domain API\'S',
    version: '1.0.0',
    description: 'PWC',
  },
  basePath: process.env.SWAGGER_BASE_PATH || config.get('v1_base_path'),
  securityDefinitions: {
    'Bearer': {
      'type': 'apiKey',
      'in': 'header',
      'name': 'Authorization',
    },
  },
  security: [
    {
      'Bearer': [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['docs/*_swagger.js'], // <-- not in the definition, but in the options
};

export default swaggerJSDoc(options);
