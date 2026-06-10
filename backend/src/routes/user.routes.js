const { Router } = require('express');
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { forbidden } = require('../utils/response.utils');

const router = Router();
router.use(authenticate);

const requireSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'Admin' || req.user.sub === +req.params.id) return next();
  return forbidden(res, 'Access denied');
};

router.get('/', requireRoles('Admin'), ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', requireRoles('Admin'), ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.patch('/:id/activate', requireRoles('Admin'), ctrl.toggleActive);
router.patch('/:id/password', requireSelfOrAdmin, ctrl.changePassword);

module.exports = router;
