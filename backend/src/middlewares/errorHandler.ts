import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";
  const details = err?.details;
  return res.status(status).json({ error: message, details });
}


