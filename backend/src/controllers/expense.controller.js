const svc = require('../services/expense.service');
const { success, created, error } = require('../utils/response.utils');

const list = (req, res, next) => { try { const r = svc.listExpenses(req.query); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getOne = (req, res, next) => { try { success(res, svc.getExpense(+req.params.id)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const create = (req, res, next) => { try { created(res, svc.createExpense(req.body, req.user.sub)); } catch (e) { next(e); } };
const update = (req, res, next) => { try { success(res, svc.updateExpense(+req.params.id, req.body, req.user.sub)); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const remove = (req, res, next) => { try { svc.deleteExpense(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { e.status ? error(res, e.message, e.status) : next(e); } };
const approve = (req, res, next) => { try { success(res, svc.approveExpense(+req.params.id, req.body.status, req.user.sub)); } catch (e) { next(e); } };
const getCategories = (req, res, next) => { try { success(res, svc.getCategories()); } catch (e) { next(e); } };
const getSummary = (req, res, next) => { try { success(res, svc.getSummary(req.query)); } catch (e) { next(e); } };

module.exports = { list, getOne, create, update, remove, approve, getCategories, getSummary };
