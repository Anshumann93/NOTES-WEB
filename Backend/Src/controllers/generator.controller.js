const generatorService = require('../services/generator.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const generateFromUrl = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  const userId = req.user._id;

  if (!url) {
    throw new ApiError(400, 'URL is required');
  }

  const note = await generatorService.createPendingNoteAndEnqueue(url, userId, options || {});

  return res.status(202).json(
    new ApiResponse(202, note, 'Job accepted and added to processing queue')
  );
});

module.exports = {
  generateFromUrl
};
