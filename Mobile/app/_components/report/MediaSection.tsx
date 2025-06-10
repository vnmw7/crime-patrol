import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormData } from "../../../types/reportTypes";

interface PropertySectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  theme: any;
  triggerHaptic: () => void;
  mediaButtonsScale: Animated.Value;
  handleAttachMedia: (type: string) => void;
  recording?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

const MediaSection: React.FC<PropertySectionProps> = ({
  formData,
  updateFormData,
  theme,
  triggerHaptic,
  mediaButtonsScale,
  handleAttachMedia,
  recording, // Destructure recording state
  isUploading = false,
  uploadProgress = 0,
}) => {
  const removeMedia = (index: number) => {
    triggerHaptic();
    const updatedMedia = [...(formData.media || [])];
    updatedMedia.splice(index, 1);
    updateFormData("media", updatedMedia);
  };

  const renderMediaPreview = (media: any, index: number) => {
    return (
      <View key={index} style={styles.mediaPreviewContainer}>
        <View
          style={[
            styles.mediaPreview,
            {
              backgroundColor: theme.progressBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Media Type Icon and Preview */}{" "}
          <View style={styles.mediaPreviewContent}>
            {media.media_type === "photo" && (media.url || media.localUri) ? (
              <Image
                source={{ uri: media.localUri || media.url }}
                style={styles.mediaThumbnail}
                resizeMode="cover"
                onError={() => console.log("Failed to load image preview")}
              />
            ) : (
              <Ionicons
                name={
                  media.media_type === "photo"
                    ? "image"
                    : media.media_type === "video"
                      ? "videocam"
                      : "musical-notes"
                }
                size={40}
                color={theme.textSecondary}
              />
            )}
            <View style={styles.mediaInfo}>
              <Text
                style={[styles.mediaPreviewText, { color: theme.text }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {media.file_name_original}
              </Text>
              <Text
                style={[styles.mediaTypeText, { color: theme.textSecondary }]}
              >
                {media.media_type.toUpperCase()}
                {media.isUploaded === false && " • Ready to upload"}
                {media.isUploading && " • Uploading..."}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={() => removeMedia(index)}
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={theme.secondary}
            style={{ backgroundColor: theme.card, borderRadius: 12 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Evidence</Text>
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Attach Media Evidence
        </Text>{" "}
        {/* Media buttons with improved layout */}
        <Animated.View
          style={[
            styles.mediaButtonsContainer,
            { transform: [{ scale: mediaButtonsScale }] },
          ]}
        >
          {/* Row 1 - Photos */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("photo_gallery")}
            disabled={isUploading}
          >
            <Ionicons name="images" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Gallery Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("photo_camera")}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Take Photo
            </Text>
          </TouchableOpacity>

          {/* Row 2 - Videos */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("video_gallery")}
            disabled={isUploading}
          >
            <Ionicons name="film" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Gallery Video
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("video_camera")}
            disabled={isUploading}
          >
            <Ionicons name="videocam" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Record Video
            </Text>
          </TouchableOpacity>

          {/* Row 3 - Audio */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("audio_file")}
            disabled={isUploading}
          >
            <Ionicons name="attach" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Audio File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("audio_record")}
            disabled={isUploading}
          >
            <Ionicons name="mic" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              {recording ? "Stop Recording" : "Record Audio"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        {/* Upload Progress Indicator */}
        {isUploading && (
          <View style={styles.uploadProgressContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.uploadProgressText, { color: theme.text }]}>
              Uploading... {uploadProgress > 0 ? `${uploadProgress}%` : ""}
            </Text>
          </View>
        )}
        {/* Enhanced Media Preview */}
        {formData.media && formData.media.length > 0 && (
          <View style={styles.mediaPreviewSectionContainer}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              Attached Media ({formData.media.length}):
            </Text>
            {formData.media.map((media, index) =>
              renderMediaPreview(media, index),
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#FF3B30",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 120,
    fontSize: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    width: "48%",
    marginBottom: 12,
  },
  mediaButtonText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  mediaPreviewContainer: {
    marginTop: 12,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  mediaPreview: {
    // Added back mediaPreview style
    width: "100%",
    height: 100, // Adjusted height for a more compact preview
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", // To align icon and text horizontally
    paddingHorizontal: 10, // Add some padding
  },
  mediaPreviewContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  mediaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  mediaInfo: {
    flex: 1,
    justifyContent: "center",
  },
  mediaPreviewText: {
    // Added back mediaPreviewText style
    marginLeft: 10, // Add some space between icon and text
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink and be ellipsized
  },
  mediaTypeText: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 4,
  },
  removeMediaButton: {
    // Added back removeMediaButton style
    position: "absolute",
    top: 8,
    right: 8,
  },
  mediaPreviewSectionContainer: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  uploadProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  uploadProgressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});

export default MediaSection;
