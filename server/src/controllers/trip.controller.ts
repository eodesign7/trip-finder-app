import { Request, Response } from "express";
import { logToAllClients } from "../lib/helpers";

export function tripSearchController(req: Request, res: Response) {
  const { from, to, date, passengers } = req.body;

  logToAllClients("⚙️SERVER: Processing trip...");
  logToAllClients(
    `⚙️SERVER: Looking for trip: ${from} => ${to}, date: ${date}, passengers: ${passengers}`
  );
  logToAllClients("⚙️SERVER: Trip received, processing request...");

  res.status(200).json({ message: "Trip search received!", data: req.body });
}
