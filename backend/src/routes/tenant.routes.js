const { Router } = require('express');
const ctrl = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/', requireRoles('Admin'), ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.patch('/:id/move-out', requireRoles('Admin'), ctrl.moveOut);

module.exports = router;
