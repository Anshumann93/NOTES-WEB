const { Router } = require('express');
const {
  getNotes,
  createNote,
  updateNote,
  getNoteById,
  deleteNote,
  getNoteStatus
} = require('../controllers/note.controller');

// Import the existing generator controller
const { generateFromUrl } = require('../controllers/generator.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

// All note routes require authentication
router.use(verifyJWT);

// Mapping the generation endpoint to match frontend requirement
router.route('/generate').post(generateFromUrl);

router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);
router.route('/:id/status').get(getNoteStatus);

module.exports = router;
