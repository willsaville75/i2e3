import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = undefined;

  // Handle known ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } 
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.message;
  }
  // Handle JSON parse errors
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
    details = err.message;
  }
  // Log unexpected errors
  else {
    console.error('Unexpected error:', err);
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'development') {
      details = err.message;
    }
  }

  res.status(statusCode).json({
    error: message,
    details,
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
} 