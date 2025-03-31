import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Switch,
  Alert,
  Linking,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { INCIDENT_TYPES } from "../constants/reportConstants";
import { FormData } from "../types/reportTypes";

interface IncidentSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  theme: any;
  colorScheme: string;
  triggerHaptic: () => void;
  selectorScale: Animated.Value;
}

const IncidentSection: React.FC<IncidentSectionProps> = ({
  formData,
  updateFormData,
  theme,
  colorScheme,
  triggerHaptic,
  selectorScale,
}) => {
  const [showTypeSelectorModal, setShowTypeSelectorModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Toggle incident type selector with animation
  const toggleTypeSelector = () => {
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

    setShowTypeSelectorModal(true);
  };

  // Select incident type
  const selectIncidentType = (type: string) => {
    triggerHaptic();
    updateFormData("incidentType", type);
    setShowTypeSelectorModal(false);
  };

  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Incident Information
      </Text>

      {/* Incident Type Field */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Type of Crime/Incident <Text style={styles.requiredStar}>*</Text>
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
            onPress={toggleTypeSelector}
            activeOpacity={0.8}
          >
            <Text
              style={[
                formData.incidentType
                  ? { color: theme.text }
                  : { color: theme.textSecondary },
              ]}
            >
              {formData.incidentType || "Select incident type"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Incident Type Selector Dropdown */}
        {showTypeSelectorModal && (
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
              {INCIDENT_TYPES.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.typeOption,
                    {
                      borderBottomColor: theme.border,
                    },
                  ]}
                  onPress={() => selectIncidentType(type)}
                >
                  <Text style={[styles.typeOptionText, { color: theme.text }]}>
                    {type}
                  </Text>
                  {formData.incidentType === type && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Date & Time of Incident */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Date and Time of Incident <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.dateTimeContainer}>
          {/* Date Picker Button */}
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={theme.primary} />
            <Text style={{ color: theme.text, marginLeft: 8 }}>
              {formData.incidentDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {/* Time Picker Button */}
          <TouchableOpacity
            style={[
              styles.dateTimeButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={theme.primary} />
            <Text style={{ color: theme.text, marginLeft: 8 }}>
              {formData.incidentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.incidentDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                updateFormData("incidentDate", selectedDate);
              }
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={formData.incidentTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                updateFormData("incidentTime", selectedTime);
              }
            }}
          />
        )}
      </View>

      {/* Emergency Alert */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Is this incident in progress now?
        </Text>
        <View style={styles.toggleContainer}>
          <Text style={[{ color: theme.text }]}>No</Text>
          <Switch
            value={formData.isInProgress}
            onValueChange={(value) => {
              updateFormData("isInProgress", value);
              if (value) {
                // Show emergency alert when toggled on
                Alert.alert(
                  "Emergency Alert",
                  "If this incident is happening now and requires immediate attention, please call emergency services.",
                  [
                    {
                      text: "Call Emergency",
                      onPress: () => Linking.openURL("tel:911"),
                    },
                    { text: "Continue Report", onPress: () => {} },
                  ],
                );
              }
            }}
            trackColor={{
              false: theme.progressBackground,
              true: theme.secondary,
            }}
            thumbColor="#FFFFFF"
          />
          <Text style={[{ color: theme.text }]}>Yes</Text>
        </View>
      </View>

      {/* Weapons Involved */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Were weapons involved?
        </Text>
        <View style={styles.toggleContainer}>
          <Text style={[{ color: theme.text }]}>No</Text>
          <Switch
            value={formData.weaponsInvolved}
            onValueChange={(value) => updateFormData("weaponsInvolved", value)}
            trackColor={{
              false: theme.progressBackground,
              true: theme.primary,
            }}
            thumbColor="#FFFFFF"
          />
          <Text style={[{ color: theme.text }]}>Yes</Text>
        </View>
      </View>

      {/* Conditional Weapons Description */}
      {formData.weaponsInvolved && (
        <View style={[styles.formField, { marginTop: -5 }]}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Weapon Description
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
            value={formData.weaponsDescription}
            onChangeText={(text) => updateFormData("weaponsDescription", text)}
            placeholder="Describe the weapon(s) used..."
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      )}

      {/* Description Field */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Detailed Description <Text style={styles.requiredStar}>*</Text>
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
          placeholder="Provide a detailed, chronological account of what happened..."
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          value={formData.description}
          onChangeText={(text) => updateFormData("description", text)}
        />
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
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 120,
    fontSize: 15,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120,
  },
});

export default IncidentSection;
