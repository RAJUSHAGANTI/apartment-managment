const { Router } = require('express');
const ctrl = require('../controllers/amenity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.patch('/:id/status', requireRoles('Admin'), ctrl.updateStatus);

module.exports = router;
