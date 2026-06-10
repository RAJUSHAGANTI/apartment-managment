const svc = require('../services/user.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listUsers(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getUser(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = async (req, res, next) => { try { created(res, await svc.createUser(req.body, req.user.sub)); } catch (e) { next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateUser(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteUser(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const toggleActive = (req, res, next) => { try { success(res, svc.toggleActive(+req.params.id, req.body.is_active, req.user.sub)); } catch (e) { next(e); } };
const changePassword = async (req, res, next) => { try { await svc.changePassword(+req.params.id, req.body.current_password, req.body.new_password); success(res, null, 'Password changed'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };

module.exports = { list, getOne, create, update, remove, toggleActive, changePassword };
