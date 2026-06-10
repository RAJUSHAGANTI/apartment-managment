const svc = require('../services/amenity.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listAmenities(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getAmenity(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = (req, res, next) => { try { created(res, svc.createAmenity(req.body, req.user.sub)); } catch (e) { next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateAmenity(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteAmenity(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const updateStatus = (req, res, next) => { try { success(res, svc.updateStatus(+req.params.id, req.body.status, req.user.sub)); } catch (e) { next(e); } };

module.exports = { list, getOne, create, update, remove, updateStatus };
