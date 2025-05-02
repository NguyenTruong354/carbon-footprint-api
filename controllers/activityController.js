const activityService = require('../services/activityService');
const { errorResponse, successResponse } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Create a new activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createActivity = async (req, res, next) => {
  try {
    const { activity_type, details, carbon_kg } = req.body;
    const userId = req.user.id;

    if (!activity_type || !details || carbon_kg === undefined) {
      return res.status(400).json(errorResponse('Activity type, details, and carbon_kg are required'));
    }

    const activity = await activityService.createActivity(userId, activity_type, details, carbon_kg);
    
    logger.info(`Activity created for user ${userId}: ${activity_type}`);
    return res.status(201).json(successResponse('Activity created successfully', activity));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all activities for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activities = await activityService.getAllActivities(userId);
    
    logger.info(`Retrieved ${activities.length} activities for user ${userId}`);
    return res.status(200).json(successResponse('Activities retrieved successfully', activities));
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single activity by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getActivityById = async (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (isNaN(activityId)) {
      return res.status(400).json(errorResponse('Invalid activity ID'));
    }
    
    const activity = await activityService.getActivityById(activityId, userId);
    
    logger.info(`Retrieved activity ${activityId} for user ${userId}`);
    return res.status(200).json(successResponse('Activity retrieved successfully', activity));
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateActivity = async (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);
    const userId = req.user.id;
    const { activity_type, details, carbon_kg } = req.body;
    
    if (isNaN(activityId)) {
      return res.status(400).json(errorResponse('Invalid activity ID'));
    }
    
    if (!activity_type || !details || carbon_kg === undefined) {
      return res.status(400).json(errorResponse('Activity type, details, and carbon_kg are required'));
    }
    
    await activityService.updateActivity(activityId, userId, activity_type, details, carbon_kg);
    
    logger.info(`Updated activity ${activityId} for user ${userId}`);
    return res.status(200).json(successResponse('Activity updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteActivity = async (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (isNaN(activityId)) {
      return res.status(400).json(errorResponse('Invalid activity ID'));
    }
    
    await activityService.deleteActivity(activityId, userId);
    
    logger.info(`Deleted activity ${activityId} for user ${userId}`);
    return res.status(200).json(successResponse('Activity deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Estimate carbon emissions for an activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.estimateEmissions = async (req, res, next) => {
  try {
    const { activity_type } = req.query;
    let details;
    
    // Parse details from query string if provided as JSON string
    if (req.query.details) {
      try {
        details = JSON.parse(req.query.details);
      } catch (e) {
        return res.status(400).json(errorResponse('Invalid details format. Must be valid JSON'));
      }
    }
    
    if (!activity_type || !details) {
      return res.status(400).json(errorResponse('Activity type and details are required'));
    }
    
    const estimation = await activityService.estimateEmissions(activity_type, details);
    
    logger.info(`Estimated emissions for ${activity_type} activity`);
    return res.status(200).json(successResponse('Emissions estimated successfully', estimation));
  } catch (error) {
    next(error);
  }
};