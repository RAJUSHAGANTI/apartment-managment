const tenantRepo = require('../repositories/tenant.repository');
const aptRepo = require('../repositories/apartment.repository');

const listTenants = (query) => tenantRepo.findAllWithApartment({
  page: +query.page || 1, limit: +query.limit || 20,
  is_active: query.is_active !== undefined ? +query.is_active : undefined,
  search: query.search, apartment_id: +query.apartment_id || undefined,
});

const getTenant = (id) => {
  const t = tenantRepo.findById(id);
  if (!t) throw { status: 404, message: 'Tenant not found' };
  return t;
};

const createTenant = (data, userId) => {
  const tenant = tenantRepo.create(data, userId);
  if (data.apartment_id) {
    aptRepo.update(data.apartment_id, { status: 'Occupied' }, userId);
  }
  return tenant;
};

const updateTenant = (id, data, userId) => {
  const t = tenantRepo.findById(id);
  if (!t) throw { status: 404, message: 'Tenant not found' };
  return tenantRepo.update(id, data, userId);
};

const deleteTenant = (id, userId) => {
  const t = tenantRepo.findById(id);
  if (!t) throw { status: 404, message: 'Tenant not found' };
  return tenantRepo.softDelete(id, userId);
};

const moveOut = (id, moveOutDate, userId) => {
  const t = tenantRepo.findById(id);
  if (!t) throw { status: 404, message: 'Tenant not found' };
  tenantRepo.moveOut(id, moveOutDate, userId);
  if (t.apartment_id) {
    const others = tenantRepo.rawQuery(
      'SELECT id FROM tenants WHERE apartment_id = ? AND is_active = 1 AND is_deleted = 0 AND id != ?',
      [t.apartment_id, id]
    );
    if (others.length === 0) {
      aptRepo.update(t.apartment_id, { status: 'Vacant' }, userId);
    }
  }
  return tenantRepo.findById(id);
};

module.exports = { listTenants, getTenant, createTenant, updateTenant, deleteTenant, moveOut };
