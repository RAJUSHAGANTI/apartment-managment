const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required().label('Username or email'),
  password: Joi.string().required().label('Password'),
  rememberMe: Joi.boolean().default(false),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshSchema };
