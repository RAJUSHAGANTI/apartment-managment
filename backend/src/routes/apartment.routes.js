const { Router } = require('express');
const ctrl = require('../controllers/apartment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/blocks', ctrl.listBlocks);
router.post('/blocks', requireRoles('Admin'), ctrl.createBlock);
router.get('/', ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.get('/:id/owner-history', requireRoles('Admin'), ctrl.ownerHistory);
router.get('/:id/tenant-history', requireRoles('Admin'), ctrl.tenantHistory);

module.exports = router;
