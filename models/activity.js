const pool = require('../config/database');
const logger = require('../utils/logger');

class Activity {
  static async create(userId, activityType, details, carbonKg) {
    try {
      // Ensure details is properly stringified JSON
      const detailsJson = typeof details === 'string' ? details : JSON.stringify(details);
      
      const [result] = await pool.query(
        'INSERT INTO activities (user_id, activity_type, details, carbon_kg) VALUES (?, ?, ?, ?)',
        [userId, activityType, detailsJson, carbonKg]
      );
      return result.insertId;
    } catch (error) {
      logger.error(`Error in create activity: ${error.message}`);
      throw error;
    }
  }

  static async findById(id, userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM activities WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (rows.length === 0) {
        return null;
      }

      // Parse JSON details with error handling
      const activity = rows[0];
      try {
        // Check if details is already an object
        if (typeof activity.details === 'object' && activity.details !== null) {
          // No need to parse, it's already an object
        } else if (typeof activity.details === 'string') {
          activity.details = JSON.parse(activity.details);
        } else {
          // Default to empty object if we can't parse
          logger.warn(`Could not parse activity details for ID ${id}, defaulting to empty object`);
          activity.details = {};
        }
      } catch (parseError) {
        logger.error(`JSON parse error for activity ${id}: ${parseError.message}`);
        // Default to empty object on error
        activity.details = {};
      }
      
      return activity;
    } catch (error) {
      logger.error(`Error in findById: ${error.message}`);
      throw error;
    }
  }

  static async findAllByUserId(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      // Parse JSON details for each activity with error handling
      return rows.map(activity => {
        try {
          if (typeof activity.details === 'object' && activity.details !== null) {
            // Already an object, no need to parse
            return activity;
          } else if (typeof activity.details === 'string') {
            return {
              ...activity,
              details: JSON.parse(activity.details)
            };
          } else {
            return {
              ...activity,
              details: {}
            };
          }
        } catch (parseError) {
          logger.error(`JSON parse error for activity ${activity.id}: ${parseError.message}`);
          return {
            ...activity,
            details: {}
          };
        }
      });
    } catch (error) {
      logger.error(`Error in findAllByUserId: ${error.message}`);
      throw error;
    }
  }

  static async update(id, userId, activityType, details, carbonKg) {
    try {
      // Ensure details is properly stringified JSON
      const detailsJson = typeof details === 'string' ? details : JSON.stringify(details);
      
      const [result] = await pool.query(
        'UPDATE activities SET activity_type = ?, details = ?, carbon_kg = ? WHERE id = ? AND user_id = ?',
        [activityType, detailsJson, carbonKg, id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error in update activity: ${error.message}`);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM activities WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error in delete activity: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Activity;