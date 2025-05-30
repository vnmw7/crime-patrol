import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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
}

const MediaSection: React.FC<PropertySectionProps> = ({
  formData,
  updateFormData,
  theme,
  triggerHaptic,
  mediaButtonsScale,
  handleAttachMedia,
  recording, // Destructure recording state
}) => {
  const removeMedia = (index: number) => {
    triggerHaptic();
    const updatedMedia = [...(formData.Media_Attachments || [])];
    updatedMedia.splice(index, 1);
    updateFormData("Media_Attachments", updatedMedia);
    if (updatedMedia.length === 0) {
      updateFormData("Media_Attached", false); // Also update the old flag if needed or remove it
    }
  };

  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Evidence</Text>
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Attach Media Evidence
        </Text>
        <Animated.View
          style={[
            {
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "space-around",
            },
          ]}
        >
          {/* Row 1 */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
                width: "48%",
                marginBottom: 10,
              },
              { transform: [{ scale: mediaButtonsScale }] },
            ]}
            onPress={() => handleAttachMedia("photo_gallery")}
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
                width: "48%",
                marginBottom: 10,
              },
            ]}
            onPress={() => handleAttachMedia("photo_camera")}
          >
            <Ionicons name="camera" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Take Photo
            </Text>
          </TouchableOpacity>

          {/* Row 2 */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
                width: "48%",
                marginBottom: 10,
              },
            ]}
            onPress={() => handleAttachMedia("video_gallery")}
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
                width: "48%",
                marginBottom: 10,
              },
            ]}
            onPress={() => handleAttachMedia("video_camera")}
          >
            <Ionicons name="videocam" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Record Video
            </Text>
          </TouchableOpacity>

          {/* Row 3 */}
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
                width: "48%",
                marginBottom: 10,
              },
            ]}
            onPress={() => handleAttachMedia("audio_file")}
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
                width: "48%",
                marginBottom: 10,
              },
            ]}
            onPress={() => handleAttachMedia("audio_record")}
          >
            <Ionicons name="mic" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              {recording ? "Stop Recording" : "Record Audio"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Media Preview */}
        {formData.Media_Attachments &&
          formData.Media_Attachments.length > 0 && (
            <View style={styles.mediaPreviewSectionContainer}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>
                Attached Media:
              </Text>
              {formData.Media_Attachments.map((media, index) => (
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
                    <Ionicons
                      name={
                        media.type.startsWith("image")
                          ? "image"
                          : media.type.startsWith("video")
                            ? "videocam"
                            : "musical-notes"
                      }
                      size={40}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[styles.mediaPreviewText, { color: theme.text }]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {media.name} ({media.type})
                    </Text>
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
              ))}
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
    justifyContent: "space-between",
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
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
  mediaPreviewText: {
    // Added back mediaPreviewText style
    marginLeft: 10, // Add some space between icon and text
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink and be ellipsized
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
});

export default MediaSection;
