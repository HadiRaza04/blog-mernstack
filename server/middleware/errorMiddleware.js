import { NODE_ENV } from '../env.js'
// @desc    Handle 404 Not Found errors
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// @desc    General Error Handler (Catches all thrown errors)
export const errorHandler = (err, req, res, next) => {
  // If the status code is 200 but an error occurred, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    // Only show the stack trace if we are in development mode
    stack: NODE_ENV === 'production' ? null : err.stack,
  });
};