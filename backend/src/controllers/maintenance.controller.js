const svc = require('../services/maintenance.service');
const { success, created, error } = require('../utils/response.utils');

// Bills
const listBills = (req, res, next) => { try { const r = svc.listBills(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getBill = (req, res, next) => { try { success(res, svc.getBill(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const generateBills = (req, res, next) => { try { success(res, svc.generateBills(req.body.bill_month, req.body.due_date, req.user.sub), 'Bills generated'); } catch (e) { next(e); } };
const updateBill = (req, res, next) => { try { success(res, svc.updateBill(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const recordPayment = (req, res, next) => { try { success(res, svc.recordPayment(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const getReceipt = (req, res, next) => { try { success(res, svc.getBill(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };

// Requests
const listRequests = (req, res, next) => { try { const r = svc.listRequests(req.query, req.user); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getRequest = (req, res, next) => { try { success(res, svc.getRequest(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const createRequest = (req, res, next) => { try { created(res, svc.createRequest(req.body, req.user.sub)); } catch (e) { next(e); } };
const updateRequest = (req, res, next) => { try { success(res, svc.updateRequest(+req.params.id, req.body, req.user.sub)); } catch (e) { next(e); } };
const deleteRequest = (req, res, next) => { try { svc.deleteRequest(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { next(e); } };

module.exports = { listBills, getBill, generateBills, updateBill, recordPayment, getReceipt, listRequests, getRequest, createRequest, updateRequest, deleteRequest };
