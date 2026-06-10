const svc = require('../services/tenant.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listTenants(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getTenant(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = (req, res, next) => { try { created(res, svc.createTenant(req.body, req.user.sub)); } catch (e) { next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateTenant(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteTenant(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const moveOut = (req, res, next) => { try { success(res, svc.moveOut(+req.params.id, req.body.move_out_date, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };

module.exports = { list, getOne, create, update, remove, moveOut };
