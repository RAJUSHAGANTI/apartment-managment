const { Router } = require('express');
const ctrl = require('../controllers/community.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');

const router = Router();
router.use(authenticate);

router.get('/notices', ctrl.listNotices);
router.post('/notices', requireRoles('Admin'), ctrl.createNotice);
router.get('/notices/:id', ctrl.getNotice);
router.put('/notices/:id', requireRoles('Admin'), ctrl.updateNotice);
router.delete('/notices/:id', requireRoles('Admin'), ctrl.deleteNotice);

router.get('/events', ctrl.listEvents);
router.post('/events', requireRoles('Admin'), ctrl.createEvent);
router.get('/events/:id', ctrl.getEvent);
router.put('/events/:id', requireRoles('Admin'), ctrl.updateEvent);
router.delete('/events/:id', requireRoles('Admin'), ctrl.deleteEvent);

router.get('/alerts', ctrl.listAlerts);
router.post('/alerts', requireRoles('Admin'), ctrl.createAlert);
router.get('/alerts/:id', ctrl.getAlert);
router.put('/alerts/:id', requireRoles('Admin'), ctrl.updateAlert);
router.delete('/alerts/:id', requireRoles('Admin'), ctrl.deleteAlert);

module.exports = router;
