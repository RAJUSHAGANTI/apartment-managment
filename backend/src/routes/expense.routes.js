const { Router } = require('express');
const ctrl = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/categories', ctrl.getCategories);
router.get('/summary', ctrl.getSummary);
router.get('/', requireRoles('Admin', 'Owner'), ctrl.list);
router.post('/', requireRoles('Admin'), ctrl.create);
router.get('/:id', requireRoles('Admin', 'Owner'), ctrl.getOne);
router.put('/:id', requireRoles('Admin'), ctrl.update);
router.delete('/:id', requireRoles('Admin'), ctrl.remove);
router.patch('/:id/approve', requireRoles('Admin'), ctrl.approve);

module.exports = router;
