// Error constants
const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_NOT_FOUND: 'User not found',
  ACTIVITY_NOT_FOUND: 'Activity not found',
  SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  MISSING_TOKEN: 'Authentication token is required'
};

// Response formatters
const errorResponse = (message, data = null) => ({
  success: false,
  message,
  data
});

const successResponse = (message, data = null) => ({
  success: true,
  message,
  data
});

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class BadRequestError extends AppError {
  constructor(message = ERROR_MESSAGES.BAD_REQUEST) {
    super(message, ERROR_CODES.BAD_REQUEST);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, ERROR_CODES.UNAUTHORIZED);
  }
}

class NotFoundError extends AppError {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message, ERROR_CODES.NOT_FOUND);
  }
}

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  errorResponse,
  successResponse,
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError
};