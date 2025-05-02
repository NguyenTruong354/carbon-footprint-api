const activityRepository = require('../repositories/activityRepository');
const externalApiService = require('./externalApiService');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError } = require('../utils/constants');

/**
 * Service for activity business logic
 */
class ActivityService {
  /**
   * Create a new carbon footprint activity
   * @param {number} userId - The user ID
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @param {number} carbonKg - The carbon emission in kilograms
   * @returns {Promise<Object>} The created activity
   */
  async createActivity(userId, activityType, details, carbonKg) {
    try {
      this.validateActivityData(activityType, details);
      
      const activityId = await activityRepository.createActivity(
        userId,
        activityType,
        details,
        carbonKg
      );
      
      logger.info(`Activity created with ID ${activityId} for user ${userId}`);
      return await activityRepository.findActivityById(activityId, userId);
    } catch (error) {
      logger.error(`ActivityService.createActivity error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all activities for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} List of activities
   */
  async getAllActivities(userId) {
    try {
      logger.info(`Getting all activities for user ${userId}`);
      return await activityRepository.findAllActivities(userId);
    } catch (error) {
      logger.error(`ActivityService.getAllActivities error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a specific activity by ID
   * @param {number} activityId - The activity ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} The activity
   * @throws {NotFoundError} If activity not found
   */
  async getActivityById(activityId, userId) {
    try {
      logger.info(`Getting activity ${activityId} for user ${userId}`);
      const activity = await activityRepository.findActivityById(activityId, userId);
      
      if (!activity) {
        throw new NotFoundError('Activity not found');
      }
      
      return activity;
    } catch (error) {
      logger.error(`ActivityService.getActivityById error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing activity
   * @param {number} activityId - The activity ID
   * @param {number} userId - The user ID
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @param {number} carbonKg - The carbon emission in kilograms
   * @returns {Promise<boolean>} True if updated successfully
   * @throws {NotFoundError} If activity not found
   */
  async updateActivity(activityId, userId, activityType, details, carbonKg) {
    try {
      this.validateActivityData(activityType, details);
      
      // Check if activity exists
      const activity = await activityRepository.findActivityById(activityId, userId);
      if (!activity) {
        throw new NotFoundError('Activity not found');
      }
      
      // Update activity
      const updated = await activityRepository.updateActivity(
        activityId,
        userId,
        activityType,
        details,
        carbonKg
      );
      
      if (!updated) {
        throw new Error('Failed to update activity');
      }
      
      logger.info(`Activity ${activityId} updated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`ActivityService.updateActivity error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an activity
   * @param {number} activityId - The activity ID
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {NotFoundError} If activity not found
   */
  async deleteActivity(activityId, userId) {
    try {
      // Check if activity exists
      const activity = await activityRepository.findActivityById(activityId, userId);
      if (!activity) {
        throw new NotFoundError('Activity not found');
      }
      
      // Delete activity
      const deleted = await activityRepository.deleteActivity(activityId, userId);
      if (!deleted) {
        throw new Error('Failed to delete activity');
      }
      
      logger.info(`Activity ${activityId} deleted for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`ActivityService.deleteActivity error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Estimate carbon emissions for an activity
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @returns {Promise<Object>} The estimated emissions data
   */
  async estimateEmissions(activityType, details) {
    try {
      this.validateActivityData(activityType, details);
      
      logger.info(`Estimating emissions for ${activityType}`);
      const estimationData = await externalApiService.estimateEmissions(activityType, details);
      
      return {
        activity: {
          activity_type: activityType,
          details,
          carbon_kg: estimationData.carbon_kg
        },
        tip: estimationData.tip
      };
    } catch (error) {
      logger.error(`ActivityService.estimateEmissions error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate activity data
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @throws {BadRequestError} If validation fails
   */
  validateActivityData(activityType, details) {
    // Validate activity type
    if (!activityType) {
      throw new BadRequestError('Activity type is required');
    }
    
    const validActivityTypes = ['transport', 'electricity', 'food'];
    if (!validActivityTypes.includes(activityType)) {
      throw new BadRequestError(`Invalid activity type: ${activityType}`);
    }
    
    // Validate details based on activity type
    if (!details || typeof details !== 'object') {
      throw new BadRequestError('Activity details are required and must be an object');
    }
    
    switch (activityType) {
      case 'transport':
        if (!details.distance || !details.vehicle) {
          throw new BadRequestError('Transport details must include distance and vehicle');
        }
        break;
        
      case 'electricity':
        if (!details.energy || !details.country) {
          throw new BadRequestError('Electricity details must include energy and country');
        }
        break;
        
      case 'food':
        if (!details.food_type || !details.quantity) {
          throw new BadRequestError('Food details must include food type and quantity');
        }
        break;
    }
  }
}

module.exports = new ActivityService();