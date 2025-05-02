const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const { UnauthorizedError, BadRequestError } = require('../utils/constants');

/**
 * Service for authentication and authorization
 */
class AuthService {
  /**
   * Authenticate a user and generate JWT token
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object>} Object containing success flag and token or error message
   */
  async login(username, password) {
    try {
      // Find user by username
      const user = await userRepository.findByUsername(username);
      if (!user) {
        logger.warn(`Login attempt with non-existent username: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Verify password
      const passwordValid = await userRepository.verifyPassword(password, user.password);
      if (!passwordValid) {
        logger.warn(`Failed login attempt for user: ${username}`);
        return { success: false, message: 'Invalid username or password' };
      }

      // Generate JWT token
      const token = this.generateToken(user);
      logger.info(`Successful login for user: ${username}`);
      
      return { success: true, token, userId: user.id };
    } catch (error) {
      logger.error(`AuthService.login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {string} username - The username
   * @param {string} password - The password
   * @param {string} email - The email address
   * @returns {Promise<Object>} Object containing success flag and userId or error message
   */
  async register(username, password, email) {
    try {
      // Check if username already exists
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser) {
        return { success: false, message: 'Username already taken' };
      }

      // Create new user
      const userId = await userRepository.createUser(username, password, email);
      logger.info(`New user registered: ${username}`);
      
      return { success: true, userId };
    } catch (error) {
      logger.error(`AuthService.register error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate JWT token for a user
   * @param {Object} user - The user object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username 
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '24h' }
    );
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();