const repo = require('../repositories/community.repository');
const { success, created } = require('../utils/response.utils');

// Notices
const listNotices = (req, res, next) => { try { const r = repo.findNotices({ ...req.query, page: +req.query.page || 1, limit: +req.query.limit || 20 }); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getNotice = (req, res, next) => { try { success(res, repo.findNoticeById(+req.params.id)); } catch (e) { next(e); } };
const createNotice = (req, res, next) => { try { created(res, repo.createNotice(req.body, req.user.sub)); } catch (e) { next(e); } };
const updateNotice = (req, res, next) => { try { success(res, repo.updateNotice(+req.params.id, req.body, req.user.sub)); } catch (e) { next(e); } };
const deleteNotice = (req, res, next) => { try { repo.deleteNotice(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { next(e); } };

// Events
const listEvents = (req, res, next) => { try { const r = repo.findEvents({ ...req.query, page: +req.query.page || 1, limit: +req.query.limit || 20 }); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getEvent = (req, res, next) => { try { success(res, repo.findEventById(+req.params.id)); } catch (e) { next(e); } };
const createEvent = (req, res, next) => { try { created(res, repo.createEvent(req.body, req.user.sub)); } catch (e) { next(e); } };
const updateEvent = (req, res, next) => { try { success(res, repo.updateEvent(+req.params.id, req.body, req.user.sub)); } catch (e) { next(e); } };
const deleteEvent = (req, res, next) => { try { repo.deleteEvent(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { next(e); } };

// Alerts
const listAlerts = (req, res, next) => { try { const r = repo.findAlerts({ ...req.query, page: +req.query.page || 1, limit: +req.query.limit || 20 }); success(res, r.data, 'OK', 200, r.pagination); } catch (e) { next(e); } };
const getAlert = (req, res, next) => { try { success(res, repo.findAlertById(+req.params.id)); } catch (e) { next(e); } };
const createAlert = (req, res, next) => { try { created(res, repo.createAlert(req.body, req.user.sub)); } catch (e) { next(e); } };
const updateAlert = (req, res, next) => { try { success(res, repo.updateAlert(+req.params.id, req.body, req.user.sub)); } catch (e) { next(e); } };
const deleteAlert = (req, res, next) => { try { repo.deleteAlert(+req.params.id, req.user.sub); success(res, null, 'Deleted'); } catch (e) { next(e); } };

module.exports = { listNotices, getNotice, createNotice, updateNotice, deleteNotice, listEvents, getEvent, createEvent, updateEvent, deleteEvent, listAlerts, getAlert, createAlert, updateAlert, deleteAlert };
