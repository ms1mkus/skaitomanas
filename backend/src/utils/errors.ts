export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}
