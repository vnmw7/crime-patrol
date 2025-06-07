# Cloudinary Setup Guide for Crime Patrol

## Overview

The Crime Patrol mobile app has been updated to use Cloudinary for file uploads instead of Appwrite Storage to resolve persistent upload issues. This guide provides step-by-step instructions to configure Cloudinary for the app.

## Prerequisites

1. Cloudinary account (free tier available)
2. Cloudinary Cloud Name, API Key, and API Secret
3. Environment variables configured in `.env` file

## Step 1: Environment Variables

Ensure your `.env` file contains the following Cloudinary configuration:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Legacy variables (for backward compatibility)
COUDINARY_CLOUD_NAME=your_cloud_name
COUDINARY_API_KEY=your_api_key
COUDINARY_API_SECRET=your_api_secret
```

## Step 2: Create Unsigned Upload Preset

**CRITICAL**: The app requires an unsigned upload preset named `crime_patrol_unsigned` to function properly.

### Instructions:

1. Log in to your [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Configure the preset with these settings:

#### Basic Settings:

- **Preset name**: `crime_patrol_unsigned`
- **Signing Mode**: **Unsigned** (IMPORTANT!)
- **Use filename**: Enabled
- **Unique filename**: Enabled

#### Upload Manipulations:

- **Folder**: `crime_patrol_uploads` (optional but recommended)
- **Auto tagging**: `crime_patrol,mobile_app`

#### Media Analysis:

- **Quality analysis**: Enabled (for better compression)
- **Image metadata**: Enabled

#### Security & Access:

- **Resource type**: `Auto`
- **Allowed formats**: `jpg,jpeg,png,mp4,mov,avi,mp3,m4a,wav`
- **Max file size**: `10485760` (10MB - adjust as needed)

#### Responsive Breakpoints:

- Leave default or customize based on your needs

5. Click **Save** to create the preset

## Step 3: Verify Configuration

### Test Upload Endpoint:

You can test the preset using curl:

```bash
curl -X POST \
  "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload" \
  -F "file=@/path/to/test/image.jpg" \
  -F "upload_preset=crime_patrol_unsigned"
```

### Expected Response:

```json
{
  "public_id": "crime_patrol_uploads/unique_filename",
  "version": 1234567890,
  "signature": "...",
  "width": 1920,
  "height": 1080,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-01-01T00:00:00Z",
  "tags": ["crime_patrol", "mobile_app"],
  "bytes": 154826,
  "type": "upload",
  "etag": "...",
  "placeholder": false,
  "url": "http://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/...",
  "secure_url": "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/..."
}
```

## Step 4: Database Updates

The app now stores Cloudinary metadata in the Appwrite database:

### Media Collection Schema:

- `file_id`: Cloudinary public_id
- `secure_url`: Cloudinary HTTPS URL
- `public_id`: Cloudinary public_id (redundant with file_id)
- `cloudinary_url`: Cloudinary HTTP URL
- `file_size`: File size in bytes
- `format`: File format (jpg, mp4, etc.)

## Step 5: Testing

### In the React Native App:

1. **Start the development server**:

   ```bash
   cd "c:\projects\crime-patrol\Mobile"
   npx expo start
   ```

2. **Test media uploads**:
   - Open the app and navigate to report creation
   - Try uploading an image, video, and audio file
   - Verify uploads appear in Cloudinary console
   - Check that media displays correctly in the app

### Troubleshooting:

#### Common Issues:

1. **"Upload preset not found"**:

   - Verify preset name is exactly `crime_patrol_unsigned`
   - Ensure signing mode is set to "Unsigned"

2. **"Network request failed"**:

   - Check internet connection
   - Verify Cloudinary credentials in `.env`
   - Check if file size exceeds preset limits

3. **"File type not supported"**:

   - Add the file format to allowed formats in preset
   - Common formats: `jpg,jpeg,png,gif,mp4,mov,avi,mp3,m4a,wav`

4. **"Authentication failed"**:
   - For unsigned uploads, this usually means preset configuration issues
   - Verify the preset exists and is set to unsigned mode

#### Debug Information:

Check the React Native logs for detailed error messages:

```bash
npx expo start --clear
```

Look for logs starting with:

- `"Uploading to Cloudinary:"`
- `"Cloudinary upload attempt"`
- `"Cloudinary upload response:"`
- `"Cloudinary upload error:"`

## Step 6: Production Considerations

### Security Settings:

For production, consider these additional security measures:

1. **Signed Uploads**: Convert to signed uploads for production
2. **Access Modes**: Set appropriate access modes for media
3. **Transformation Limits**: Configure transformation quotas
4. **Webhook Notifications**: Set up webhooks for upload monitoring

### Folder Organization:

Organize uploads by:

- Environment: `crime_patrol_prod/`, `crime_patrol_dev/`
- Type: `images/`, `videos/`, `audio/`
- Date: Include date stamps in folder structure

### Example Production Preset:

```
Preset name: crime_patrol_prod
Signing Mode: Signed (for production)
Folder: crime_patrol_prod/${auto:upload_date}/${auto:resource_type}
Max file size: 20971520 (20MB)
Allowed formats: jpg,jpeg,png,mp4,mov,m4a,wav
Quality: auto:good
```

## Support

If you encounter issues:

1. Check the [Cloudinary documentation](https://cloudinary.com/documentation)
2. Review the mobile app logs for specific error messages
3. Verify environment variables are correctly set
4. Test the upload preset manually using curl or Postman

## Migration Notes

This setup replaces the previous Appwrite Storage implementation while maintaining backward compatibility in the database schema. The `file_id` field now stores Cloudinary public_ids instead of Appwrite file IDs.
