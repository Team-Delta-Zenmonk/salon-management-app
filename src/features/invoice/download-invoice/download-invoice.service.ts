import { axiosInstance } from "../../../config/axios";

export interface DownloadInvoiceResponse {
  url: string | null;
}

export const downloadInvoiceService = async (bookingId: number | string): Promise<DownloadInvoiceResponse> => {
  const response = await axiosInstance.get<DownloadInvoiceResponse>(`/invoices/booking/${bookingId}/download`);
  return response.data;
};
