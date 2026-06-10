const jwt = require('jsonwebtoken');
const config = require('../config/jwt.config');

const generateAccessToken = (payload) =>
  jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.refreshSecret, { expiresIn: config.refreshExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, config.secret);

const verifyRefreshToken = (token) => jwt.verify(token, config.refreshSecret);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
