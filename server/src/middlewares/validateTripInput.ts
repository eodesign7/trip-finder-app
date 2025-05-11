import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const tripSchema = z.object({
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  date: z.string().min(1, "Date is required"),
  passengers: z.number().int().positive("Passengers must be a positive number"),
});

export function validateTripInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parseResult = tripSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: "Invalid input.",
      errors: parseResult.error.errors.map((e) => e.message),
    });
  }

  // Ak je validácia OK, prepíš req.body na typovaný objekt
  req.body = parseResult.data;
  next();
}
