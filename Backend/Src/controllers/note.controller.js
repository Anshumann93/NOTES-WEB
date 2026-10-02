const noteService = require('../services/note.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit, category, isTrash, sort } = req.query;

  const result = await noteService.getAllNotes(userId, { page, limit, category, isTrash, sort });

  return res.status(200).json(
    new ApiResponse(200, result, 'Notes retrieved successfully')
  );
});

const createNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const note = await noteService.createNote(req.body, userId);
  return res.status(201).json(new ApiResponse(201, note, 'Note created'));
});

const updateNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const note = await noteService.updateNote(id, req.body, userId);
  return res.status(200).json(new ApiResponse(200, note, 'Note updated'));
});

const getNoteById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const note = await noteService.getNoteById(id, userId);

  return res.status(200).json(
    new ApiResponse(200, note, 'Note retrieved successfully')
  );
});

const deleteNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const permanent = req.query.permanent === 'true';

  await noteService.deleteNote(id, userId, permanent);

  return res.status(200).json(
    new ApiResponse(200, {}, permanent ? 'Note permanently deleted' : 'Note moved to trash')
  );
});

const getNoteStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const statusInfo = await noteService.getNoteStatus(id, userId);

  return res.status(200).json(
    new ApiResponse(200, statusInfo, 'Note status retrieved successfully')
  );
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  getNoteById,
  deleteNote,
  getNoteStatus
};
