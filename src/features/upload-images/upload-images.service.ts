import type { CloudinaryFile } from "../../common/cloudinary.schema";
import { axiosInstance } from "../../config/axios";

export const uploadImages = async (file: File): Promise<CloudinaryFile> => {
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await axiosInstance.post("/salons/upload-images", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return Array.isArray(res.data) ? res.data[0] : res.data;
};
