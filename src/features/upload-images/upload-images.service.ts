import type { CloudinaryFile } from "../../common/cloudinary.schema";
import { axiosInstance } from "../../config/axios";
import axios from "axios";

export interface PresignedUrlItem {
  filename?: string;
  filetype: string;
  folder?: string;
}

export interface PresignedUrlResponse {
  filename?: string;
  filetype: string;
  category: "image" | "pdf" | "document";
  resource_type: "image" | "raw";
  upload_url: string;
  params: {
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
    upload_preset: string;
    allowed_formats: string;
    max_file_size: number;
    allowed_types: string[];
  };
}

export const getPresignedUrls = async (
  files: PresignedUrlItem[]
): Promise<PresignedUrlResponse[]> => {
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || "general";
  const formattedFiles = files.map((f) => ({
    filename: f.filename,
    filetype: f.filetype,
    folder: f.folder || folder,
  }));

  const res = await axiosInstance.post("/salons/upload-images/presigned-url", {
    files: formattedFiles,
  });

  return res.data?.data || [];
};

export const uploadImages = async (file: File): Promise<CloudinaryFile> => {
  const results = await uploadMultipleFiles([file]);
  return results[0];
};

export const uploadMultipleFiles = async (
  files: File[],
  folderName?: string
): Promise<CloudinaryFile[]> => {
  if (!files.length) return [];

  const presignedList = await getPresignedUrls(
    files.map((file) => ({
      filename: file.name,
      filetype: file.type,
      folder: folderName,
    }))
  );

  const uploadPromises = files.map(async (file, idx) => {
    const presigned = presignedList[idx];
    if (!presigned || !presigned.upload_url) {
      throw new Error(`Failed to generate presigned upload URL for ${file.name}`);
    }

    if (file.size > presigned.params.max_file_size) {
      const maxMb = (presigned.params.max_file_size / (1024 * 1024)).toFixed(1);
      throw new Error(`File '${file.name}' (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of ${maxMb}MB.`);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", presigned.params.api_key);
    formData.append("timestamp", presigned.params.timestamp.toString());
    formData.append("signature", presigned.params.signature);
    formData.append("folder", presigned.params.folder);
    formData.append("allowed_formats", presigned.params.allowed_formats);
    formData.append("upload_preset", presigned.params.upload_preset);

    const response = await axios.post(presigned.upload_url, formData);
    const result = response.data;

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      type: result.type,
      secure_url: result.secure_url,
      asset_folder: result.asset_folder,
      filename: file.name,
    } as CloudinaryFile;
  });

  return await Promise.all(uploadPromises);
};
