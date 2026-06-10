const { error } = require('../utils/response.utils');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error: err, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (err) {
    const errors = err.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return error(res, 'Validation failed', 422, errors);
  }
  req[source] = value;
  next();
};

module.exports = { validate };
