import express, { Request, Response, NextFunction, Application } from "express";
import mementoRoute from "./memento";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.sendStatus(200);
});

router.post("/api/memento", mementoRoute);

export default router;
