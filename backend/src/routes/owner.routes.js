const { Router } = require('express');
const ctrl = require('../controllers/owner.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/', requireRoles('Admin'), ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', requireRoles('Admin', 'Owner'), ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.get('/:id/apartments', requireRoles('Admin', 'Owner'), ctrl.getApartments);
router.post('/:id/apartments', requireRoles('Admin'), ctrl.assignApartment);
router.delete('/:id/apartments/:aptId', requireRoles('Admin'), ctrl.removeAssignment);

module.exports = router;
