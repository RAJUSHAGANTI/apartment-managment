const aptRepo = require('../repositories/apartment.repository');
const blockRepo = require('../repositories/block.repository');

const listApartments = (query, user) => {
  const { page, limit, status, flat_type, block_id, search } = query;
  return aptRepo.findAllWithBlock({ page: +page || 1, limit: +limit || 20, status, flat_type, block_id: +block_id || undefined, search });
};

const getApartment = (id) => {
  const apt = aptRepo.findByIdWithDetails(id);
  if (!apt) throw { status: 404, message: 'Apartment not found' };
  if (apt.current_owners) try { apt.current_owners = JSON.parse(apt.current_owners); } catch {}
  if (apt.current_tenant) try { apt.current_tenant = JSON.parse(apt.current_tenant); } catch {}
  return apt;
};

const createApartment = (data, userId) => aptRepo.create(data, userId);

const updateApartment = (id, data, userId) => {
  const apt = aptRepo.findById(id);
  if (!apt) throw { status: 404, message: 'Apartment not found' };
  return aptRepo.update(id, data, userId);
};

const deleteApartment = (id, userId) => {
  const apt = aptRepo.findById(id);
  if (!apt) throw { status: 404, message: 'Apartment not found' };
  return aptRepo.softDelete(id, userId);
};

const getOwnerHistory = (id) => aptRepo.getOwnerHistory(id);
const getTenantHistory = (id) => aptRepo.getTenantHistory(id);

const listBlocks = () => blockRepo.rawQuery('SELECT * FROM blocks WHERE is_deleted = 0 ORDER BY name');
const createBlock = (data, userId) => blockRepo.create(data, userId);
const updateBlock = (id, data, userId) => blockRepo.update(id, data, userId);

module.exports = { listApartments, getApartment, createApartment, updateApartment, deleteApartment, getOwnerHistory, getTenantHistory, listBlocks, createBlock, updateBlock };
