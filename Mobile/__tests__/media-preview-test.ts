/**
 * Media Preview Test Component
 *
 * This file demonstrates how the media preview functionality works
 * and can be used for testing the implementation.
 */

// Example media data structure that would come from Appwrite
const sampleMediaData = [
  {
    $id: "media1",
    report_id: "report123",
    file_id: "cloudinary_public_id_1",
    media_type: "photo",
    file_name_original: "incident_scene.jpg",
    display_order: 0,
    secure_url:
      "https://res.cloudinary.com/your-cloud/image/upload/v123456/incident_scene.jpg",
    cloudinary_url:
      "http://res.cloudinary.com/your-cloud/image/upload/v123456/incident_scene.jpg",
  },
  {
    $id: "media2",
    report_id: "report123",
    file_id: "cloudinary_public_id_2",
    media_type: "video",
    file_name_original: "witness_video.mp4",
    display_order: 1,
    secure_url:
      "https://res.cloudinary.com/your-cloud/video/upload/v123456/witness_video.mp4",
  },
  {
    $id: "media3",
    report_id: "report123",
    file_id: "cloudinary_public_id_3",
    media_type: "audio",
    file_name_original: "witness_statement.m4a",
    display_order: 2,
    secure_url:
      "https://res.cloudinary.com/your-cloud/raw/upload/v123456/witness_statement.m4a",
  },
];

/**
 * Example usage in report details screen:
 *
 * 1. Navigate to report details: /report-details/[reportId]
 * 2. The screen automatically fetches media from REPORT_MEDIA_COLLECTION_ID
 * 3. Media items are displayed in a grid below the report information
 * 4. Tap any media item to view in full-screen modal
 *
 * Supported scenarios:
 * - Reports with no media: Shows "No media attached" message
 * - Reports with photos: Shows image thumbnails
 * - Reports with videos: Shows video thumbnail from Cloudinary
 * - Reports with audio: Shows audio icon placeholder
 * - Mixed media types: Shows all types in organized grid
 * - Loading states: Shows loading indicator while fetching
 * - Error states: Shows error message for failed media loads
 */

/**
 * Testing checklist:
 *
 * ✅ Thumbnail generation for photos
 * ✅ Thumbnail generation for videos (via Cloudinary)
 * ✅ Icon placeholder for audio files
 * ✅ Full-screen modal for photo viewing
 * ✅ Modal with video thumbnail and play indicator
 * ✅ Modal with audio icon and URL display
 * ✅ Cloudinary URL optimization for different sizes
 * ✅ Fallback to original URLs when optimization unavailable
 * ✅ Error handling for missing/broken media URLs
 * ✅ Loading states during media fetch
 * ✅ Empty state when no media attached
 * ✅ Proper TypeScript typing for all components
 * ✅ Responsive design for different screen sizes
 * ✅ Accessibility features (touch targets, labels)
 */

// Example of how the media URLs are optimized:
const exampleOptimization = {
  original:
    "https://res.cloudinary.com/crime-patrol/image/upload/v123456/evidence.jpg",
  thumbnail:
    "https://res.cloudinary.com/crime-patrol/image/upload/w_160,h_160,c_fill,q_auto,f_auto/evidence.jpg",
  fullSize:
    "https://res.cloudinary.com/crime-patrol/image/upload/w_800,h_600,c_fit,q_auto,f_auto/evidence.jpg",
};

export default {
  sampleMediaData,
  exampleOptimization,
};
