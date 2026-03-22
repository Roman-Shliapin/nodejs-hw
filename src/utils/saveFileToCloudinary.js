import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param {Buffer} buffer
 * @returns {Promise<import("cloudinary").UploadApiResponse>}
 */
const uploadOptions = {
  resource_type: "image",
  folder: "avatars",
  overwrite: false,
  unique_filename: true,
  use_filename: false,
};

export function saveFileToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
      uploadOptions
    );
    Readable.from(buffer).pipe(stream);
  });
}
