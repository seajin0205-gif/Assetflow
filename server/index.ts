import "dotenv/config";
import express from "express";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
import type { DatabaseSync } from "node:sqlite";
import { handleDemo } from "./routes/demo";
import { ProblemError, problem, sendProblem } from "./http/problem";
import { tradingRateLimit } from "./http/rate-limit";
import { getSharedDatabase } from "./orders/db";
import { createOrderRouter } from "./orders/routes";

export type ServerOptions = {
  database?: DatabaseSync;
};

export function createServer(options: ServerOptions = {}) {
  const app = express();
  const database = options.database ?? getSharedDatabase();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.use("/api/orders", tradingRateLimit());
  app.use("/api/orders", createOrderRouter(database));

  app.use((req, res, next) => {
    if (!req.originalUrl.startsWith("/api")) {
      next();
      return;
    }
    sendProblem(
      res,
      problem(
        404,
        "not-found",
        "Not Found",
        `No endpoint matches ${req.method} ${req.path}.`,
        req.originalUrl,
      ),
    );
  });

  const handleError: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err instanceof ProblemError) {
      sendProblem(res, {
        ...err.problem,
        instance: err.problem.instance ?? req.originalUrl,
      });
      return;
    }
    if (err instanceof SyntaxError && "body" in err) {
      sendProblem(
        res,
        problem(
          400,
          "invalid-json",
          "Invalid JSON",
          "Request body must be valid JSON.",
          req.originalUrl,
        ),
      );
      return;
    }
    sendProblem(
      res,
      problem(
        500,
        "internal-error",
        "Internal Server Error",
        "The request could not be processed.",
        req.originalUrl,
      ),
    );
  };
  app.use(handleError);

  return app;
}
