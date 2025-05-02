const authService = require('../services/authService');
const { errorResponse, successResponse } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json(errorResponse('Username and password are required'));
    }
    
    const result = await authService.login(username, password);
    if (!result.success) {
      return res.status(401).json(errorResponse(result.message));
    }
    
    logger.info(`User ${username} logged in successfully`);
    return res.status(200).json(successResponse('Login successful', { token: result.token }));
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json(errorResponse('Username, password, and email are required'));
    }
    
    const result = await authService.register(username, password, email);
    if (!result.success) {
      return res.status(400).json(errorResponse(result.message));
    }
    
    logger.info(`User ${username} registered successfully`);
    return res.status(201).json(successResponse('Registration successful', { userId: result.userId }));
  } catch (error) {
    next(error);
  }
};