const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!secret || !refreshSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
  }
  console.warn('WARNING: JWT_SECRET/JWT_REFRESH_SECRET not set — using insecure defaults. Set them in .env before deploying.');
}

module.exports = {
  secret: secret || 'fallback-secret-change-in-production',
  refreshSecret: refreshSecret || 'fallback-refresh-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
