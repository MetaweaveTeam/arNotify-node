import { Response } from "express";

export class DBError extends Error {
  statusCode = 500;
  code = 5001;

  constructor(message: string, e: any) {
    super(message);

    console.error("[db]: " + e);

    Object.setPrototypeOf(this, DBError.prototype);
  }

  getErrorMessage() {
    return "internal error, code: " + this.code;
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 5002;

  constructor(element: string, message: string) {
    super(message);

    console.error("[db]: did not find " + element);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  // up to one's opsec to decide if they want to
  // tell the user they didn't find an item or not
  getErrorMessage() {
    return "internal error, code: " + this.code;
  }
}

export class TwitterError extends Error {
  statusCode = 500;
  code = 5003;

  constructor(message: string, e: any) {
    super(message);

    console.error("[twitter]: error from the twitter api " + e);

    Object.setPrototypeOf(this, TwitterError.prototype);
  }

  getErrorMessage() {
    return "internal error, code: " + this.code;
  }
}

export class UnauthorizedError extends Error {
  statusCode = 403;
  code = 5004;

  constructor(message: string) {
    super(message);

    console.error(
      "[auth]: authentication error, cookie either not sent or invalid/expired"
    );

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  getErrorMessage() {
    return "Unauthorized: " + this.message;
  }
}

export function handleAPIError(e: any, res: Response) {
  if (
    e instanceof TwitterError ||
    e instanceof DBError ||
    e instanceof NotFoundError ||
    e instanceof UnauthorizedError
  ) {
    return res
      .status(e.statusCode)
      .json({ error: e.getErrorMessage(), code: e.code });
  } else {
    console.error("[unknown]: unknown error", e);
    res.status(500).json({ error: "internal error" });
  }
}

export function handleCronError(e: any) {
  if (e instanceof TwitterCronError || e instanceof ArweaveError) {
    // do nothing
  } else {
    console.error("[cron_unknown]: unknown error", e);
  }
}

export class TwitterCronError extends Error {
  code = 1001;

  constructor(message: string, e: any) {
    super(message);

    console.error("[twitter_cron]; " + e);

    Object.setPrototypeOf(this, TwitterCronError.prototype);
  }
}

export class ArweaveError extends Error {
  code = 1002;

  constructor(message: string, e: any) {
    super(message);

    console.error("[arweave]: " + e);

    Object.setPrototypeOf(this, TwitterCronError.prototype);
  }
}
