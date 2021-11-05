import express, { Request, Response, NextFunction, Application } from "express";
import router from "./routes";

export default function createServer() {
  const app: Application = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb" }));

  app.use(router);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("not found");
    return res.status(404).json({
      message: error.message,
    });
  });
  return app;
}
