const { Router } = require('express');
const { generateFromUrl } = require('../controllers/generator.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT); // Secure all generator routes

router.route('/url').post(generateFromUrl);

module.exports = router;
