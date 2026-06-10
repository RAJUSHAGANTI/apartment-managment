const { serverError } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  serverError(res, err.message || 'Internal server error');
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFoundHandler };
