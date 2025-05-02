const { ERROR_CODES, errorResponse } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  
  // Default error status and message
  const statusCode = err.statusCode || ERROR_CODES.SERVER_ERROR;
  const message = err.isOperational ? err.message : 'Internal server error';
  
  // Send error response
  res.status(statusCode).json(errorResponse(message));
  
  // If error is not operational (unexpected), log full error details
  if (!err.isOperational) {
    logger.error(err.stack);
  }
};

module.exports = errorHandler;