const { Router } = require('express');
const ctrl = require('../controllers/maintenance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

// Bills
router.get('/bills', ctrl.listBills);
router.post('/bills/generate', requireRoles('Admin'), ctrl.generateBills);
router.get('/bills/:id', ctrl.getBill);
router.put('/bills/:id', requireRoles('Admin'), ctrl.updateBill);
router.post('/bills/:id/payment', requireRoles('Admin'), ctrl.recordPayment);
router.get('/bills/:id/receipt', ctrl.getReceipt);

// Requests
router.get('/requests', ctrl.listRequests);
router.post('/requests', ctrl.createRequest);
router.get('/requests/:id', ctrl.getRequest);
router.put('/requests/:id', requireRoles('Admin'), ctrl.updateRequest);
router.delete('/requests/:id', requireRoles('Admin'), ctrl.deleteRequest);

module.exports = router;
