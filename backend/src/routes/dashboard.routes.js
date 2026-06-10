const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/admin', requireRoles('Admin'), ctrl.adminDashboard);
router.get('/owner', requireRoles('Owner'), ctrl.ownerDashboard);
router.get('/tenant', requireRoles('Tenant'), ctrl.tenantDashboard);

module.exports = router;
