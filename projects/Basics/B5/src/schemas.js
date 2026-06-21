import { z } from "zod";

export const transactionCreateSchema = z.object({
  amount: z.number().positive("amount must be greater than 0"),
  type: z.enum(["deposit", "withdrawal"]),
  description: z.string().max(200).optional(),
});
