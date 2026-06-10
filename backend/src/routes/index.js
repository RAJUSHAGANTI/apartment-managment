const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/apartments', require('./apartment.routes'));
router.use('/owners', require('./owner.routes'));
router.use('/tenants', require('./tenant.routes'));
router.use('/amenities', require('./amenity.routes'));
router.use('/maintenance', require('./maintenance.routes'));
router.use('/expenses', require('./expense.routes'));
router.use('/reports', require('./report.routes'));
router.use('/community', require('./community.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
