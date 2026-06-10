const authService = require('../services/auth.service');
const userRepo = require('../repositories/user.repository');
const { success, error } = require('../utils/response.utils');

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login(identifier, password);
    success(res, result, 'Login successful');
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
};

const refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = authService.refresh(refreshToken);
    success(res, tokens, 'Token refreshed');
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
};

const logout = (req, res, next) => {
  try {
    authService.logout(req.user.sub);
    success(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
};

const me = (req, res) => {
  const user = userRepo.findById(req.user.sub);
  success(res, userRepo.safeFields(user));
};

const forgotPassword = async (req, res, next) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    // In production, send token via email. For now return it in dev mode.
    const data = process.env.NODE_ENV === 'development' ? { resetToken: token } : null;
    success(res, data, 'If that email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    success(res, null, 'Password reset successful');
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
};

module.exports = { login, refresh, logout, me, forgotPassword, resetPassword };
