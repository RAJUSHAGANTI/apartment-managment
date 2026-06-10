const userRepo = require('../repositories/user.repository');
const { hash, compare } = require('../utils/bcrypt.utils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { v4: uuidv4 } = require('uuid');

const buildTokenPayload = (user) => ({
  sub: user.id,
  email: user.email,
  role: user.role,
  firstName: user.first_name,
  lastName: user.last_name,
});

const login = async (identifier, password) => {
  const user = userRepo.findByEmailOrUsername(identifier);
  if (!user || !user.is_active) throw { status: 401, message: 'Invalid credentials' };

  const valid = await compare(password, user.password_hash);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  userRepo.setRefreshToken(user.id, refreshToken);
  userRepo.updateLastLogin(user.id);

  return { accessToken, refreshToken, user: userRepo.safeFields(user) };
};

const refresh = (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const user = userRepo.findById(decoded.sub);
  if (!user || user.refresh_token !== refreshToken) {
    throw { status: 401, message: 'Refresh token reuse detected' };
  }

  const payload = buildTokenPayload(user);
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  userRepo.setRefreshToken(user.id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = (userId) => {
  userRepo.clearRefreshToken(userId);
};

const forgotPassword = (email) => {
  const user = userRepo.findByEmail(email);
  if (!user) return null; // silently succeed — don't reveal existence

  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
  userRepo.setResetToken(user.id, token, expires);
  return token;
};

const resetPassword = async (token, newPassword) => {
  const user = userRepo.findByResetToken(token);
  if (!user) throw { status: 400, message: 'Invalid or expired reset token' };

  const hashed = await hash(newPassword);
  userRepo.updatePassword(user.id, hashed);
  userRepo.clearRefreshToken(user.id);
};

module.exports = { login, refresh, logout, forgotPassword, resetPassword };
