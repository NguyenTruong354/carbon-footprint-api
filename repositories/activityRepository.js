const Activity = require('../models/activity');
const logger = require('../utils/logger');

/**
 * Repository for activity data access
 */
class ActivityRepository {
  /**
   * Create a new activity
   * @param {number} userId - The user ID
   * @param {string} activityType - The type of activity (e.g., transport, food)
   * @param {Object} details - The activity details as JSON object
   * @param {number} carbonKg - The carbon emission in kilograms
   * @returns {Promise<number>} The ID of the created activity
   */
  async createActivity(userId, activityType, details, carbonKg) {
    try {
      logger.info(`Creating activity for user ${userId}: ${activityType}`);
      return await Activity.create(userId, activityType, details, carbonKg);
    } catch (error) {
      logger.error(`ActivityRepository.createActivity error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find activity by ID for a specific user
   * @param {number} id - The activity ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object|null>} The activity or null if not found
   */
  async findActivityById(id, userId) {
    try {
      logger.info(`Finding activity ${id} for user ${userId}`);
      return await Activity.findById(id, userId);
    } catch (error) {
      logger.error(`ActivityRepository.findActivityById error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all activities for a specific user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} List of activities
   */
  async findAllActivities(userId) {
    try {
      logger.info(`Finding all activities for user ${userId}`);
      return await Activity.findAllByUserId(userId);
    } catch (error) {
      logger.error(`ActivityRepository.findAllActivities error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing activity
   * @param {number} id - The activity ID
   * @param {number} userId - The user ID
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @param {number} carbonKg - The carbon emission in kilograms
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateActivity(id, userId, activityType, details, carbonKg) {
    try {
      logger.info(`Updating activity ${id} for user ${userId}`);
      return await Activity.update(id, userId, activityType, details, carbonKg);
    } catch (error) {
      logger.error(`ActivityRepository.updateActivity error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an activity
   * @param {number} id - The activity ID
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteActivity(id, userId) {
    try {
      logger.info(`Deleting activity ${id} for user ${userId}`);
      return await Activity.delete(id, userId);
    } catch (error) {
      logger.error(`ActivityRepository.deleteActivity error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ActivityRepository();