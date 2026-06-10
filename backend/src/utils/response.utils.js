const success = (res, data, message = 'OK', statusCode = 200, pagination = null) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

const created = (res, data, message = 'Created') => success(res, data, message, 201);

const error = (res, message = 'Error', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = 'Not found') => error(res, message, 404);

const forbidden = (res, message = 'Forbidden') => error(res, message, 403);

const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);

const serverError = (res, message = 'Internal server error') => error(res, message, 500);

module.exports = { success, created, error, notFound, forbidden, unauthorized, serverError };
