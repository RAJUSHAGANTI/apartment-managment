const svc = require('../services/owner.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listOwners(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getOwner(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = (req, res, next) => { try { created(res, svc.createOwner(req.body, req.user.sub)); } catch (e) { next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateOwner(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteOwner(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const getApartments = (req, res, next) => { try { success(res, svc.getOwnerApartments(+req.params.id)); } catch (e) { next(e); } };
const assignApartment = (req, res, next) => { try { svc.assignApartment(+req.params.id, req.body, req.user.sub); success(res, null, 'Assigned'); } catch (e) { next(e); } };
const removeAssignment = (req, res, next) => { try { svc.removeApartmentAssignment(+req.params.id, +req.params.aptId, req.user.sub); success(res, null, 'Removed'); } catch (e) { next(e); } };

module.exports = { list, getOne, create, update, remove, getApartments, assignApartment, removeAssignment };
