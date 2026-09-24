import { useState, useCallback } from "react";
import { downloadInvoiceService } from "../download-invoice/download-invoice.service";
import { callSnack } from "../../../components/snackbar";

export const useDownloadInvoice = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadInvoice = useCallback(async (bookingId: number | string | undefined) => {
    if (!bookingId) {
      callSnack("Booking identifier not found", "error");
      return;
    }

    setIsDownloading(true);
    try {
      const res = await downloadInvoiceService(bookingId);
      if (res?.url) {
        window.open(res.url, "_blank");
      } else {
        callSnack("Your invoice is being generated. Please check back in a moment!", "info");
      }
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      callSnack("Your invoice is being generated. Please check back in a moment!", "info");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadInvoice, isDownloading };
};
