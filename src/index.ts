import express, { Request, Response, NextFunction, Application } from "express";

export default function createServer() {
  const app: Application = express();
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello worl22d");
  });
  return app;
}
