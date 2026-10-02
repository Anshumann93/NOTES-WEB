const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await dashboardService.getStats(userId);

  return res.status(200).json(
    new ApiResponse(200, stats, 'Dashboard statistics fetched successfully')
  );
});

module.exports = {
  getDashboardStats
};
