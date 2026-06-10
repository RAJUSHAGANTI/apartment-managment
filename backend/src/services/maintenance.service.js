const maintRepo = require('../repositories/maintenance.repository');

const listBills = (query) => maintRepo.findBillsWithApartment({
  page: +query.page || 1, limit: +query.limit || 20,
  payment_status: query.payment_status,
  bill_month: query.bill_month,
  apartment_id: +query.apartment_id || undefined,
});

const getBill = (id) => {
  const b = maintRepo.findById(id);
  if (!b) throw { status: 404, message: 'Bill not found' };
  return b;
};

const generateBills = (billMonth, dueDate, userId) => maintRepo.generateMonthlyBills(billMonth, dueDate, userId);

const updateBill = (id, data, userId) => {
  const b = maintRepo.findById(id);
  if (!b) throw { status: 404, message: 'Bill not found' };
  const total = (data.base_amount ?? b.base_amount) + (data.amenity_amount ?? b.amenity_amount) + (data.penalty_amount ?? b.penalty_amount) - (data.discount_amount ?? b.discount_amount);
  return maintRepo.update(id, { ...data, total_amount: total }, userId);
};

const recordPayment = (id, paymentData, userId) => {
  const b = maintRepo.findById(id);
  if (!b) throw { status: 404, message: 'Bill not found' };
  return maintRepo.recordPayment(id, paymentData, userId);
};

const listRequests = (query, user) => {
  const filters = {
    page: +query.page || 1, limit: +query.limit || 20,
    status: query.status,
    apartment_id: +query.apartment_id || undefined,
  };
  if (user.role === 'Tenant') {
    const db = require('../config/database');
    const tenant = db.prepare('SELECT id FROM tenants WHERE user_id = ? AND is_active = 1 AND is_deleted = 0').get(user.sub);
    if (tenant) filters.tenant_id = tenant.id;
  }
  return maintRepo.findRequests(filters);
};

const getRequest = (id) => {
  const r = maintRepo.findRequestById(id);
  if (!r) throw { status: 404, message: 'Request not found' };
  return r;
};

const createRequest = (data, userId) => maintRepo.createRequest(data, userId);
const updateRequest = (id, data, userId) => maintRepo.updateRequest(id, data, userId);
const deleteRequest = (id, userId) => maintRepo.deleteRequest(id, userId);

module.exports = { listBills, getBill, generateBills, updateBill, recordPayment, listRequests, getRequest, createRequest, updateRequest, deleteRequest };
