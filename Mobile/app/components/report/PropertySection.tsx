import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormData } from "../../types/reportTypes";

interface PropertySectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  theme: any;
  triggerHaptic: () => void;
  mediaButtonsScale: Animated.Value;
  handleAttachMedia: (type: string) => void;
}

const PropertySection: React.FC<PropertySectionProps> = ({
  formData,
  updateFormData,
  theme,
  triggerHaptic,
  mediaButtonsScale,
  handleAttachMedia,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Property and Evidence
      </Text>

      {/* Property Stolen/Damaged */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Was property stolen or damaged?
        </Text>
        <View style={styles.toggleContainer}>
          <Text style={[{ color: theme.text }]}>No</Text>
          <Switch
            value={formData.propertyInvolved}
            onValueChange={(value) => updateFormData("propertyInvolved", value)}
            trackColor={{
              false: theme.progressBackground,
              true: theme.primary,
            }}
            thumbColor="#FFFFFF"
          />
          <Text style={[{ color: theme.text }]}>Yes</Text>
        </View>
      </View>

      {/* Conditional Property Fields */}
      {formData.propertyInvolved && (
        <>
          {/* Property Description */}
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Property Description
            </Text>
            <TextInput
              style={[
                styles.descriptionInput,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                },
              ]}
              placeholder="Detailed description of items (make, model, color, etc.)"
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              value={formData.propertyDescription}
              onChangeText={(text) =>
                updateFormData("propertyDescription", text)
              }
            />
          </View>

          {/* Estimated Value */}
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Estimated Value
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                },
              ]}
              placeholder="Approximate value in dollars"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={formData.propertyValue}
              onChangeText={(text) => updateFormData("propertyValue", text)}
            />
          </View>

          {/* Serial Numbers */}
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Serial Numbers
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                },
              ]}
              placeholder="Serial numbers of stolen/damaged items"
              placeholderTextColor={theme.textSecondary}
              value={formData.serialNumbers}
              onChangeText={(text) => updateFormData("serialNumbers", text)}
            />
          </View>
        </>
      )}

      {/* Evidence Information */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Additional Evidence
        </Text>
        <TextInput
          style={[
            styles.descriptionInput,
            {
              borderColor: theme.border,
              backgroundColor: theme.inputBackground,
              color: theme.text,
            },
          ]}
          placeholder="Any physical evidence noticed (footprints, damage, dropped items, etc.)"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          value={formData.evidenceInfo}
          onChangeText={(text) => updateFormData("evidenceInfo", text)}
        />
      </View>

      {/* Media Attachments */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Attach Media Evidence
        </Text>
        <Animated.View
          style={[
            styles.mediaButtonsContainer,
            { transform: [{ scale: mediaButtonsScale }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.mediaButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => handleAttachMedia("photo")}
          >
            <Ionicons name="camera" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Photo
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
            onPress={() => handleAttachMedia("video")}
          >
            <Ionicons name="videocam" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              Video
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
            onPress={() => handleAttachMedia("file")}
          >
            <Ionicons name="attach" size={24} color={theme.primary} />
            <Text style={[styles.mediaButtonText, { color: theme.text }]}>
              File
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Media Preview */}
        {formData.mediaAttached && (
          <View style={styles.mediaPreviewContainer}>
            {/* This would render the actual image or file in a real app */}
            <View
              style={[
                styles.mediaPreview,
                {
                  backgroundColor: theme.progressBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="image" size={40} color={theme.textSecondary} />
              <Text style={[styles.mediaPreviewText, { color: theme.text }]}>
                Evidence photo
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => {
                triggerHaptic();
                updateFormData("mediaAttached", false);
              }}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={theme.secondary}
                style={{ backgroundColor: theme.card, borderRadius: 12 }}
              />
            </TouchableOpacity>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
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
  },
  mediaPreview: {
    width: "100%",
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaPreviewText: {
    marginTop: 8,
    fontSize: 14,
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});

export default PropertySection;
