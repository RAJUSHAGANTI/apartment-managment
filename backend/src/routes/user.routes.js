const { Router } = require('express');
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/', requireRoles('Admin'), ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', requireRoles('Admin'), ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.patch('/:id/activate', requireRoles('Admin'), ctrl.toggleActive);
router.patch('/:id/password', ctrl.changePassword);

module.exports = router;
