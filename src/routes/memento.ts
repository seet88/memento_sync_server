import { Express, Request, Response, NextFunction } from "express";
import { SyncService } from "../service/syncService";

export default async function mementoRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body) return res.sendStatus(401);
  const userName = req.body.userName;
  if (!userName) return res.sendStatus(401);
  const sync = new SyncService();
  try {
    const mementoChangedData = await sync.synchroniseDBWithMementoData(
      req.body
    );
    res.send(mementoChangedData);
  } catch (err) {
    res.status(400).send({
      errorMessage: (err as Error).message,
    });
  }
  //   do somethink with data
  //   res.sendStatus(200);
  return;
}
