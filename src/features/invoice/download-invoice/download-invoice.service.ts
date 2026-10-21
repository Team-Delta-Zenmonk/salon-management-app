import { axiosInstance } from "../../../config/axios";

export interface DownloadInvoiceResponse {
  url: string | null;
}

export const downloadInvoiceService = async (invoiceOrBookingId: number | string): Promise<DownloadInvoiceResponse> => {
  const response = await axiosInstance.get<DownloadInvoiceResponse>(`/invoices/${invoiceOrBookingId}/download`);
  return response.data;
};
