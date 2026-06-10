const svc = require('../services/apartment.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listApartments(req.query, req.user); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getApartment(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = (req, res, next) => { try { created(res, svc.createApartment(req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateApartment(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteApartment(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const ownerHistory = (req, res, next) => { try { success(res, svc.getOwnerHistory(+req.params.id)); } catch (e) { next(e); } };
const tenantHistory = (req, res, next) => { try { success(res, svc.getTenantHistory(+req.params.id)); } catch (e) { next(e); } };
const listBlocks = (req, res, next) => { try { success(res, svc.listBlocks()); } catch (e) { next(e); } };
const createBlock = (req, res, next) => { try { created(res, svc.createBlock(req.body, req.user.sub)); } catch (e) { next(e); } };

module.exports = { list, getOne, create, update, remove, ownerHistory, tenantHistory, listBlocks, createBlock };
