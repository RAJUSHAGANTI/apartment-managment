const { Router } = require('express');
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate, requireRoles('Admin', 'Owner'));

router.get('/maintenance', ctrl.maintenance);
router.get('/expenses', ctrl.expenses);
router.get('/occupancy', requireRoles('Admin'), ctrl.occupancy);
router.get('/defaulters', requireRoles('Admin'), ctrl.defaulters);
router.get('/export/pdf', ctrl.exportPDF);
router.get('/export/excel', ctrl.exportExcel);

module.exports = router;
