const { serverError } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  serverError(res, message);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFoundHandler };
