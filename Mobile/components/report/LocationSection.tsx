import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LOCATION_TYPES } from "../../constants/reportConstants";
import { FormData } from "../../types/reportTypes";

interface LocationSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  theme: any;
  colorScheme: string;
  triggerHaptic: () => void;
  selectorScale: Animated.Value;
}

// Address field component
const AddressField: React.FC<{
  location: string;
  updateLocation: (text: string) => void;
  theme: any;
  triggerHaptic: () => void;
}> = ({ location, updateLocation, theme, triggerHaptic }) => (
  <View style={styles.formField}>
    <Text style={[styles.fieldLabel, { color: theme.text }]}>
      Specific Address <Text style={styles.requiredStar}>*</Text>
    </Text>
    <View
      style={[
        styles.locationContainer,
        {
          borderColor: theme.border,
          backgroundColor: theme.inputBackground,
        },
      ]}
    >
      <Ionicons
        name="location"
        size={20}
        color={theme.primary}
        style={styles.locationIcon}
      />
      <TextInput
        style={[styles.locationInput, { color: theme.text }]}
        value={location}
        onChangeText={updateLocation}
        placeholder="Street address, city, etc."
        placeholderTextColor={theme.textSecondary}
      />
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={() => {
          triggerHaptic();
          // In a real app, this would get current GPS coordinates
          console.log("Getting GPS location");
        }}
      >
        <Ionicons name="locate" size={20} color={theme.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

// Location type selector component
const LocationTypeSelector: React.FC<{
  locationType: string;
  theme: any;
  colorScheme: string;
  selectorScale: Animated.Value;
  toggleSelector: () => void;
  showSelector: boolean;
  selectLocationType: (type: string) => void;
}> = ({
  locationType,
  theme,
  colorScheme,
  selectorScale,
  toggleSelector,
  showSelector,
  selectLocationType,
}) => (
  <View style={styles.formField}>
    <Text style={[styles.fieldLabel, { color: theme.text }]}>
      Location Type <Text style={styles.requiredStar}>*</Text>
    </Text>
    <Animated.View style={{ transform: [{ scale: selectorScale }] }}>
      <TouchableOpacity
        style={[
          styles.typeSelector,
          {
            borderColor: theme.border,
            backgroundColor: theme.inputBackground,
          },
        ]}
        onPress={toggleSelector}
        activeOpacity={0.8}
      >
        <Text
          style={[
            locationType
              ? { color: theme.text }
              : { color: theme.textSecondary },
          ]}
        >
          {locationType || "Select location type"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </Animated.View>

    {/* Location Type Selector Dropdown */}
    {showSelector && (
      <View
        style={[
          styles.typeSelectorDropdown,
          {
            borderColor: theme.border,
            backgroundColor: theme.card,
            ...Platform.select({
              ios: {
                shadowColor: colorScheme === "dark" ? "#000" : "#555",
              },
              android: {
                elevation: 4,
              },
            }),
          },
        ]}
      >
        <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 180 }}>
          {LOCATION_TYPES.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.typeOption,
                {
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={() => selectLocationType(type)}
            >
              <Text style={[styles.typeOptionText, { color: theme.text }]}>
                {type}
              </Text>
              {locationType === type && (
                <Ionicons name="checkmark" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

// Location details component
const LocationDetailsField: React.FC<{
  locationDetails: string;
  updateDetails: (text: string) => void;
  theme: any;
}> = ({ locationDetails, updateDetails, theme }) => (
  <View style={styles.formField}>
    <Text style={[styles.fieldLabel, { color: theme.text }]}>
      Additional Location Details
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
      placeholder="Apartment number, floor, nearby landmarks, etc."
      placeholderTextColor={theme.textSecondary}
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      value={locationDetails}
      onChangeText={updateDetails}
    />
  </View>
);

// Main component
const LocationSection: React.FC<LocationSectionProps> = ({
  formData,
  updateFormData,
  theme,
  colorScheme,
  triggerHaptic,
  selectorScale,
}) => {
  const [showLocationTypeSelectorModal, setShowLocationTypeSelectorModal] =
    useState(false);

  // Toggle location type selector with animation
  const toggleLocationTypeSelector = () => {
    triggerHaptic();

    // Add animation for feedback
    Animated.sequence([
      Animated.timing(selectorScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(selectorScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowLocationTypeSelectorModal(true);
  };
  // Select location type
  const selectLocationType = (type: string) => {
    triggerHaptic();
    updateFormData("Location_Type", type);
    setShowLocationTypeSelectorModal(false);
  };

  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Location Information
      </Text>

      <AddressField
        location={formData.Location}
        updateLocation={(text) => updateFormData("Location", text)}
        theme={theme}
        triggerHaptic={triggerHaptic}
      />

      <LocationTypeSelector
        locationType={formData.Location_Type}
        theme={theme}
        colorScheme={colorScheme}
        selectorScale={selectorScale}
        toggleSelector={toggleLocationTypeSelector}
        showSelector={showLocationTypeSelectorModal}
        selectLocationType={selectLocationType}
      />

      <LocationDetailsField
        locationDetails={formData.Location_Details}
        updateDetails={(text) => updateFormData("Location_Details", text)}
        theme={theme}
      />
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
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  typeSelectorDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  typeOptionText: {
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  gpsButton: {
    padding: 8,
  },
});

export default LocationSection;
