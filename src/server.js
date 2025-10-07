const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const configRoutes = require('./routes/config.routes');
const imageRoutes = require('./routes/image.routes');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

const { AppDataSource } = require('./database');

AppDataSource.initialize()
  .then(() => {
    console.log('TypeORM Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('TypeORM Data Source initialization error:', err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 5001;

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Cropper API',
      version: '1.0.0',
      description: 'REST API for image cropping and logo overlay functionality with unified processing endpoint',
      contact: {
        name: 'API Support',
        email: 'support@support.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        CropConfig: {
          type: 'object',
          required: ['name', 'logo_position', 'logo_scale'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Configuration name',
              example: 'My Logo Config'
            },
            logo_position: {
              type: 'string',
              enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
              description: 'Logo position on the image',
              example: 'bottom-right'
            },
            logo_scale: {
              type: 'number',
              minimum: 0.01,
              maximum: 0.25,
              description: 'Logo scale factor (1% to 25%)',
              example: 0.15
            },
            logo_image: {
              type: 'string',
              description: 'Base64 encoded logo image',
              example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message describing what went wrong'
            },
            details: {
              type: 'object',
              description: 'Additional error details (optional)'
            }
          },
          required: ['success', 'error']
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          },
          required: ['success', 'data']
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '20mb' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Image Cropper API Documentation'
}));

// Routes
app.use('/api', configRoutes);
app.use('/api', imageRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

async function startServer() {
  try {    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Server is ready to accept requests`);
      
      setInterval(() => {
        console.log(`${new Date().toLocaleTimeString()} - Server is running`);
      }, 100000);
    });
    
  } catch (error) {
    process.exit(1);
  }
}

startServer();
