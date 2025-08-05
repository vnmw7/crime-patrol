import Constants from "expo-constants";

// Cloudinary configuration from environment variables
export const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.COUDINARY_CLOUD_NAME || // Support both spellings for backward compatibility
  Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME ||
  Constants.expoConfig?.extra?.COUDINARY_CLOUD_NAME ||
  "";

export const CLOUDINARY_API_KEY =
  process.env.CLOUDINARY_API_KEY ||
  process.env.COUDINARY_API_KEY || // Support both spellings for backward compatibility
  Constants.expoConfig?.extra?.CLOUDINARY_API_KEY ||
  Constants.expoConfig?.extra?.COUDINARY_API_KEY ||
  "";

export const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.COUDINARY_API_SECRET || // Support both spellings for backward compatibility
  Constants.expoConfig?.extra?.CLOUDINARY_API_SECRET ||
  Constants.expoConfig?.extra?.COUDINARY_API_SECRET ||
  "";

// Check if Cloudinary credentials are configured
if (!CLOUDINARY_CLOUD_NAME) {
  console.error("ERROR: Cloudinary Cloud Name is not configured!");
  console.error("Please set the CLOUDINARY_CLOUD_NAME environment variable.");
}

if (!CLOUDINARY_API_KEY) {
  console.error("ERROR: Cloudinary API Key is not configured!");
  console.error("Please set the CLOUDINARY_API_KEY environment variable.");
}

if (!CLOUDINARY_API_SECRET) {
  console.error("ERROR: Cloudinary API Secret is not configured!");
  console.error("Please set the CLOUDINARY_API_SECRET environment variable.");
}

// Generate a unique public ID for the uploaded file
// const generatePublicId = (filename: string, mediaType: string): string => {
//   const timestamp = Date.now();
//   const randomId = Math.random().toString(36).substring(2, 15);
//   const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, "_");
//   return `crime_patrol/${mediaType}/${timestamp}_${randomId}_${cleanFilename}`;
// };

// Upload a file to Cloudinary
export const uploadToCloudinary = async (
  uri: string,
  filename: string,
  mediaType: string, // 'photo', 'video', 'audio'
  onProgress?: (progress: number) => void,
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
}> => {
  console.log(
    `Starting Cloudinary upload: URI='${uri}', Filename='${filename}', Type='${mediaType}'`,
  );

  return new Promise(async (resolve, reject) => {
    try {
      // Determine the resource type based on media type
      let resourceType = "auto";
      if (mediaType === "photo") {
        resourceType = "image";
      } else if (mediaType === "video") {
        resourceType = "video";
      } else if (mediaType === "audio") {
        resourceType = "raw"; // Cloudinary uses 'raw' for audio files
      }

      // Create form data for the upload - minimal approach
      const formData = new FormData();

      const fileExtension = filename.split(".").pop()?.toLowerCase();
      let actualMimeType = "application/octet-stream"; // Default

      if (mediaType === "photo") {
        actualMimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension || "jpeg"}`;
      } else if (mediaType === "video") {
        actualMimeType = `video/${fileExtension || "mp4"}`;
      } else if (mediaType === "audio") {
        // Adjust common audio types as needed
        actualMimeType = `audio/${fileExtension === "m4a" ? "aac" : fileExtension || "mp3"}`;
      }

      const fileToUpload = {
        uri: uri,
        type: actualMimeType,
        name: filename,
      };
      formData.append("file", fileToUpload as any);

      // Try multiple upload presets in order of preference
      const presetOptions = [
        "crime_patrol_unsigned", // Primary preset (needs to be created)
        "ml_default", // Common Cloudinary default
        "unsigned_default", // Another common default
        "default", // Last resort
      ];

      let uploadResponse;
      let lastError;

      for (const preset of presetOptions) {
        try {
          console.log(`Trying upload preset: ${preset}`);

          // Create a new FormData for each attempt
          const attemptFormData = new FormData();
          attemptFormData.append("file", fileToUpload as any);
          attemptFormData.append("upload_preset", preset);

          // Upload to Cloudinary using fetch (simpler approach)
          console.log(
            `Uploading to Cloudinary with resource type: ${resourceType}, MIME type: ${actualMimeType}, preset: ${preset}`,
          );

          const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
          console.log(`Constructed Cloudinary Upload URL: ${uploadUrl}`);

          const response = await fetch(uploadUrl, {
            method: "POST",
            body: attemptFormData,
          });

          console.log(
            `Cloudinary response status for preset ${preset}: ${response.status}`,
          );

          if (response.ok) {
            // Success! Parse and return the response
            uploadResponse = await response.json();
            console.log(`Upload successful with preset: ${preset}`);
            break;
          } else {
            const errorText = await response.text();
            console.warn(
              `Preset ${preset} failed: Status ${response.status}, Response: ${errorText}`,
            );
            lastError = new Error(
              `Cloudinary upload failed with preset ${preset}: ${response.status} - ${errorText}`,
            );
          }
        } catch (error: any) {
          console.warn(`Preset ${preset} error:`, error.message);
          lastError = error;
        }
      }

      if (!uploadResponse) {
        console.error(`All upload presets failed. Last error:`, lastError);
        throw lastError || new Error("All upload preset attempts failed");
      }
      console.log("Cloudinary upload successful:", {
        public_id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
        format: uploadResponse.format,
        bytes: uploadResponse.bytes,
      });

      resolve({
        public_id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
        url: uploadResponse.url,
        format: uploadResponse.format,
        resource_type: uploadResponse.resource_type,
        bytes: uploadResponse.bytes,
      });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      reject(new Error(`Failed to upload to Cloudinary: ${error.message}`));
    }
  });
};

// Delete a file from Cloudinary (for cleanup)
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: string = "image",
): Promise<boolean> => {
  try {
    console.log(`Deleting from Cloudinary: ${publicId}`);

    // For deletion, we need to use the signed API
    // This would typically be done from a backend server
    // For now, we'll just log the attempt
    console.warn(
      "Deletion from Cloudinary requires backend implementation with API secret",
    );

    return true;
  } catch (error: any) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

// Generate a transformation URL for optimized media display
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "fit" | "scale" | "thumb";
  } = {},
): string => {
  const {
    width = 400,
    height = 300,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

// Generate a video thumbnail URL
export const getVideoThumbnailUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
  } = {},
): string => {
  const { width = 400, height = 300, quality = "auto" } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/w_${width},h_${height},c_fill,q_${quality},f_jpg,so_0/${publicId}.jpg`;
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getVideoThumbnailUrl,
};
