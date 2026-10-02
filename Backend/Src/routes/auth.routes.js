const { Router } = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
} = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh').post(refreshAccessToken);
router.route('/me').get(verifyJWT, getCurrentUser);

module.exports = router;
