/**
 * Middleware de validation des requêtes avec Zod.
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type ParsedRequest = { body?: unknown; query?: unknown; params?: unknown };

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as ParsedRequest;
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (err) {
      next(err instanceof ZodError ? err : new Error(String(err)));
    }
  };
}
