import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { FormData } from "../../types/reportTypes";

interface PeopleSectionProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  theme: any;
}

const PeopleSection: React.FC<PeopleSectionProps> = ({
  formData,
  updateFormData,
  theme,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        People Involved
      </Text>

      {/* Reporter Information */}
      <View style={[styles.subSection, { borderColor: theme.border }]}>
        <Text style={[styles.subSectionTitle, { color: theme.text }]}>
          Your Information (Reporter)
        </Text>

        {/* Reporter Name */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Your Name <Text style={styles.requiredStar}>*</Text>
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
            placeholder="Enter your full name"
            placeholderTextColor={theme.textSecondary}
            value={formData.reporterName}
            onChangeText={(text) => updateFormData("reporterName", text)}
          />
        </View>

        {/* Reporter Phone */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Phone Number <Text style={styles.requiredStar}>*</Text>
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
            placeholder="For follow-up contact"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={formData.reporterPhone}
            onChangeText={(text) => updateFormData("reporterPhone", text)}
          />
        </View>

        {/* Reporter Email */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Email Address
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
            placeholder="Optional email address"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.reporterEmail}
            onChangeText={(text) => updateFormData("reporterEmail", text)}
          />
        </View>

        {/* Is Reporter the Victim */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Are you the victim of this incident?
          </Text>
          <View style={styles.toggleContainer}>
            <Text style={[{ color: theme.text }]}>No</Text>
            <Switch
              value={formData.isVictimReporter}
              onValueChange={(value) =>
                updateFormData("isVictimReporter", value)
              }
              trackColor={{
                false: theme.progressBackground,
                true: theme.primary,
              }}
              thumbColor="#FFFFFF"
            />
            <Text style={[{ color: theme.text }]}>Yes</Text>
          </View>
        </View>
      </View>

      {/* Victim Information - conditional */}
      {!formData.isVictimReporter && (
        <View style={[styles.subSection, { borderColor: theme.border }]}>
          <Text style={[styles.subSectionTitle, { color: theme.text }]}>
            Victim Information
          </Text>

          {/* Victim Name */}
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Victim Name
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
              placeholder="Enter victim's name if known"
              placeholderTextColor={theme.textSecondary}
              value={formData.victimName}
              onChangeText={(text) => updateFormData("victimName", text)}
            />
          </View>

          {/* Victim Contact */}
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Victim Contact Information
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
              placeholder="Phone number or email if known"
              placeholderTextColor={theme.textSecondary}
              value={formData.victimContact}
              onChangeText={(text) => updateFormData("victimContact", text)}
            />
          </View>
        </View>
      )}

      {/* Suspect Information */}
      <View style={[styles.subSection, { borderColor: theme.border }]}>
        <Text style={[styles.subSectionTitle, { color: theme.text }]}>
          Suspect Information
        </Text>

        {/* Suspect Description */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Suspect Description
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
            placeholder="Physical description (height, weight, clothing, identifying features, etc.)"
            placeholderTextColor={theme.textSecondary}
            multiline
            textAlignVertical="top"
            value={formData.suspectDescription}
            onChangeText={(text) => updateFormData("suspectDescription", text)}
          />
        </View>

        {/* Suspect Vehicle */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Suspect Vehicle
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
            placeholder="Make, model, color, license plate if known"
            placeholderTextColor={theme.textSecondary}
            value={formData.suspectVehicle}
            onChangeText={(text) => updateFormData("suspectVehicle", text)}
          />
        </View>
      </View>

      {/* Witness Information */}
      <View style={styles.formField}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Witness Information
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
          placeholder="Names and contact information of any witnesses"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          value={formData.witnessInfo}
          onChangeText={(text) => updateFormData("witnessInfo", text)}
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
  subSection: {
    borderTopWidth: 0.5,
    paddingTop: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
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
});

export default PeopleSection;
