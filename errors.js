class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super();
      this.statusCode = statusCode;
      this.message = message;
    }
  }

class NotFoundError extends ErrorHandler {
    constructor(message) {
        super(404, message);
    }
}

class AuthenticationError extends ErrorHandler {
    constructor(message) {
        super(401, message);
    }
}

class BadRequestError extends ErrorHandler {
    constructor(message) {
        super(400, message);
    }
}

class CustomAPIError extends ErrorHandler {
    constructor(message) {
        super(500, message);
    }
}

const handleError = (err, res) => {
    const { statusCode, message } = err;
    const code = statusCode || 500;
    res.status(code).json({
      status: "error",
      statusCode: code,
      message: message || "Internal Server Error"
    });
};

module.exports = {
    NotFoundError,
    AuthenticationError,
    BadRequestError,
    CustomAPIError,
    handleError
}