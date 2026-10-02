const { Router } = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);

router.route('/stats').get(getDashboardStats);

module.exports = router;
