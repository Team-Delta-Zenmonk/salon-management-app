import * as z from "zod";

export const getDecreaseStockSchema = (maxStock: number) =>
  z.object({
    quantity: z.coerce
      .number()
      .min(1, "Quantity must be at least 1")
      .max(maxStock, "Cannot decrease more than current stock"),
  });

export type DecreaseStockForm = {
  quantity: number;
};

