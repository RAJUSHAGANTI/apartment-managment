const userRepo = require('../repositories/user.repository');
const { hash } = require('../utils/bcrypt.utils');
const { parsePagination } = require('../utils/pagination.utils');

const listUsers = (query) => {
  const { page, limit } = parsePagination(query);
  const filters = {};
  if (query.role) filters.role = query.role;
  if (query.is_active !== undefined) filters.is_active = +query.is_active;
  const result = userRepo.findAll({ filters, page, limit });
  result.data = result.data.map(u => userRepo.safeFields(u));
  return result;
};

const getUser = (id) => {
  const u = userRepo.findById(id);
  if (!u) throw { status: 404, message: 'User not found' };
  return userRepo.safeFields(u);
};

const createUser = async (data, creatorId) => {
  data.password_hash = await hash(data.password);
  delete data.password;
  const u = userRepo.create(data, creatorId);
  return userRepo.safeFields(u);
};

const updateUser = (id, data, userId) => {
  const u = userRepo.findById(id);
  if (!u) throw { status: 404, message: 'User not found' };
  return userRepo.safeFields(userRepo.update(id, data, userId));
};

const deleteUser = (id, userId) => {
  const u = userRepo.findById(id);
  if (!u) throw { status: 404, message: 'User not found' };
  return userRepo.softDelete(id, userId);
};

const toggleActive = (id, isActive, userId) => {
  const u = userRepo.findById(id);
  if (!u) throw { status: 404, message: 'User not found' };
  return userRepo.safeFields(userRepo.update(id, { is_active: isActive ? 1 : 0 }, userId));
};

const changePassword = async (id, currentPassword, newPassword) => {
  const u = userRepo.findById(id);
  if (!u) throw { status: 404, message: 'User not found' };
  const { compare } = require('../utils/bcrypt.utils');
  const valid = await compare(currentPassword, u.password_hash);
  if (!valid) throw { status: 400, message: 'Current password is incorrect' };
  const hashed = await hash(newPassword);
  userRepo.updatePassword(id, hashed);
};

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, toggleActive, changePassword };
