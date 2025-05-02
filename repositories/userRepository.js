const User = require('../models/user');
const logger = require('../utils/logger');

/**
 * Repository for user data access
 */
class UserRepository {
  /**
   * Find a user by username
   * @param {string} username - The username to search for
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findByUsername(username) {
    try {
      logger.info(`Finding user by username: ${username}`);
      return await User.findByUsername(username);
    } catch (error) {
      logger.error(`UserRepository.findByUsername error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a user by ID
   * @param {number} id - The user ID
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findById(id) {
    try {
      logger.info(`Finding user by ID: ${id}`);
      return await User.findById(id);
    } catch (error) {
      logger.error(`UserRepository.findById error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {string} username - The username
   * @param {string} password - The password (will be hashed)
   * @param {string} email - The email address
   * @returns {Promise<number>} The ID of the created user
   */
  async createUser(username, password, email) {
    try {
      logger.info(`Creating new user: ${username}`);
      return await User.create(username, password, email);
    } catch (error) {
      logger.error(`UserRepository.createUser error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify a user's password
   * @param {string} plainPassword - The plain text password to verify
   * @param {string} hashedPassword - The hashed password to compare against
   * @returns {Promise<boolean>} True if the password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await User.verifyPassword(plainPassword, hashedPassword);
    } catch (error) {
      logger.error(`UserRepository.verifyPassword error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserRepository();