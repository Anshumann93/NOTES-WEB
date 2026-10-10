const generatorService = require('../services/generator.service');
const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/ApiResponse.js');
const ApiError = require('../utils/ApiError.js');

const generateFromUrl = asyncHandler(async (req, res) => {
  const { url, options } = req.body;
  const userId = req.user._id;

  if (!url) {
    throw new ApiError(400, 'URL is required');
  }

  const note = await generatorService.generateFromUrl(url, userId, options || {});

  return res.status(200).json(
    new ApiResponse(200, note, 'Note generated successfully')
  );
});

module.exports = {
  generateFromUrl
};
