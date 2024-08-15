export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 4xx Client Errors
export class BadRequestError extends CustomError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends CustomError {
  constructor(message: string = "Unprocessable Entity") {
    super(message, 422);
  }
}

// 5xx Server Errors
export class InternalServerError extends CustomError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
  }
}

export class NotImplementedError extends CustomError {
  constructor(message: string = "Not Implemented") {
    super(message, 501);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message: string = "Service Unavailable") {
    super(message, 503);
  }
}
