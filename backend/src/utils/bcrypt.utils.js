const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hash = (password) => bcrypt.hash(password, SALT_ROUNDS);

const compare = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hash, compare };
