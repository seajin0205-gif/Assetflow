import { Router } from "express";
import type { MarketSnapshot } from "@shared/market";
import { currentQuoteBoard, subscribeQuotes } from "./engine";

export type QuoteBoard = Pick<MarketSnapshot, "sequence" | "quotes" | "charts">;

export function createQuoteRouter(): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(toBoard(currentQuoteBoard()));
  });

  router.get("/stream", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const send = (next: MarketSnapshot) => {
      res.write(`data: ${JSON.stringify(toBoard(next))}\n\n`);
    };
    send(currentQuoteBoard());
    const unsubscribe = subscribeQuotes(send);
    const heartbeat = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });

  return router;
}

function toBoard(snapshot: MarketSnapshot): QuoteBoard {
  return {
    sequence: snapshot.sequence,
    quotes: snapshot.quotes,
    charts: snapshot.charts,
  };
}
