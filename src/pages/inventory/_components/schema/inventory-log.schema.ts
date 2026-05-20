import * as z from "zod";
import dayjs from "dayjs";

export const inventoryLogSchema = z.object({
  ordered_date: z.string().min(1, "Required"),
  received_date: z.string().min(1, "Required"),
  ordered_quantity: z.coerce.number().min(1, "Required atleast 1").max(50000, "Value must be less than or equal to 50000"),
  received_quantity: z.coerce.number().min(0, "Required").max(50000, "Value must be less than or equal to 50000"),
  damaged_quantity: z.coerce.number().min(0, "Required").max(50000, "Value must be less than or equal to 50000"),
  returned_quantity: z.coerce.number().min(0, "Required").max(50000, "V alue must be less than or equal to 50000"),
  bill_amount: z.coerce.number().min(0, "Required").max(50000, "Value must be less than or equal to 50000"),
}).superRefine((data, ctx) => {
  if (data.ordered_date && data.received_date) {
    const ordered = dayjs(data.ordered_date);
    const received = dayjs(data.received_date);
    if (received.isBefore(ordered, 'day')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["received_date"],
        message: "Invalid Date",
      });
    }
  }
});

export type InventoryLogForm = z.infer<typeof inventoryLogSchema>;
