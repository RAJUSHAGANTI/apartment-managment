require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger docs
try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../swagger/openapi.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch {
  // openapi.yaml not yet generated — swagger UI unavailable
}

// API routes
app.use('/api/v1', require('./routes/index'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
