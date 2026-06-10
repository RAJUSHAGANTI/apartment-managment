const dashRepo = require('../repositories/dashboard.repository');
const { success } = require('../utils/response.utils');

const adminDashboard = (req, res, next) => { try { success(res, dashRepo.getAdminDashboard()); } catch (e) { next(e); } };
const ownerDashboard = (req, res, next) => { try { success(res, dashRepo.getOwnerDashboard(req.user.sub)); } catch (e) { next(e); } };
const tenantDashboard = (req, res, next) => { try { success(res, dashRepo.getTenantDashboard(req.user.sub)); } catch (e) { next(e); } };

module.exports = { adminDashboard, ownerDashboard, tenantDashboard };
