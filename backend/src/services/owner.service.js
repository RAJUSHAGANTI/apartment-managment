const ownerRepo = require('../repositories/owner.repository');

const listOwners = (query) => ownerRepo.findAllWithApartments({ page: +query.page || 1, limit: +query.limit || 20, search: query.search });
const getOwner = (id) => { const o = ownerRepo.findById(id); if (!o) throw { status: 404, message: 'Owner not found' }; return o; };
const createOwner = (data, userId) => ownerRepo.create(data, userId);
const updateOwner = (id, data, userId) => { const o = ownerRepo.findById(id); if (!o) throw { status: 404, message: 'Owner not found' }; return ownerRepo.update(id, data, userId); };
const deleteOwner = (id, userId) => { const o = ownerRepo.findById(id); if (!o) throw { status: 404, message: 'Owner not found' }; return ownerRepo.softDelete(id, userId); };
const getOwnerApartments = (id) => ownerRepo.findOwnerApartments(id);
const assignApartment = (ownerId, data, userId) => ownerRepo.assignApartment(ownerId, data.apartment_id, data.ownership_from, data.ownership_share, userId);
const removeApartmentAssignment = (ownerId, aptId, userId) => ownerRepo.removeApartmentAssignment(ownerId, aptId, userId);

module.exports = { listOwners, getOwner, createOwner, updateOwner, deleteOwner, getOwnerApartments, assignApartment, removeApartmentAssignment };
