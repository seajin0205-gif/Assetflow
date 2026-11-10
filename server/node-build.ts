import path from "node:path";
import { createServer } from "./index";
import * as express from "express";
import { problem, sendProblem } from "./http/problem";

const app = createServer();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("/{*path}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    sendProblem(
      res,
      problem(
        404,
        "not-found",
        "Not Found",
        `No endpoint matches ${req.method} ${req.path}.`,
        req.path,
      ),
    );
    return;
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, host, () => {
  console.log(`Assetflow listening on http://${host}:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
