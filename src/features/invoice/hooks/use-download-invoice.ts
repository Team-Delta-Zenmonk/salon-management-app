import { useState, useCallback } from "react";
import { downloadInvoiceService } from "../download-invoice/download-invoice.service";
import { callSnack } from "../../../components/snackbar";

export const useDownloadInvoice = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

  const downloadInvoice = useCallback(async (invoiceOrBookingId: number | string | undefined, directUrl?: string | null) => {
    if (directUrl) {
      window.open(directUrl, "_blank");
      return;
    }

    if (!invoiceOrBookingId) {
      callSnack("Invoice identifier not found", "error");
      return;
    }

    setIsDownloading(true);
    setDownloadingId(invoiceOrBookingId);
    try {
      const res = await downloadInvoiceService(invoiceOrBookingId);
      if (res?.url) {
        window.open(res.url, "_blank");
      } else {
        callSnack("Your invoice is being generated. Please check back in a moment!", "info");
      }
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      callSnack("Failed to download invoice. Please try again later.", "error");
    } finally {
      setIsDownloading(false);
      setDownloadingId(null);
    }
  }, []);

  return { downloadInvoice, isDownloading, downloadingId };
};
