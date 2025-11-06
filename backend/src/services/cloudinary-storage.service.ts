import cloudinary from '../config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';

const USE_CLOUDINARY = process.env.USE_CLOUDINARY === 'true';

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sad/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('❌ Error uploading to Cloudinary:', error);
          reject(error);
        } else if (result) {
          console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Check if Cloudinary is configured and should be used
 */
export const shouldUseCloudinary = (): boolean => {
  return USE_CLOUDINARY && !!process.env.CLOUDINARY_CLOUD_NAME;
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  shouldUseCloudinary
};
