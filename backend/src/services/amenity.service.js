const amenityRepo = require('../repositories/amenity.repository');

const listAmenities = (query) => amenityRepo.findAll({ page: +query.page || 1, limit: +query.limit || 50 });
const getAmenity = (id) => { const a = amenityRepo.findById(id); if (!a) throw { status: 404, message: 'Amenity not found' }; return a; };
const createAmenity = (data, userId) => amenityRepo.create(data, userId);
const updateAmenity = (id, data, userId) => { const a = amenityRepo.findById(id); if (!a) throw { status: 404, message: 'Amenity not found' }; return amenityRepo.update(id, data, userId); };
const deleteAmenity = (id, userId) => { const a = amenityRepo.findById(id); if (!a) throw { status: 404, message: 'Amenity not found' }; return amenityRepo.softDelete(id, userId); };
const updateStatus = (id, status, userId) => updateAmenity(id, { status }, userId);

module.exports = { listAmenities, getAmenity, createAmenity, updateAmenity, deleteAmenity, updateStatus };
