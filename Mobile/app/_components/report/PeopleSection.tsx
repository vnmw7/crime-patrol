import React from "react";
import { View, Text, StyleSheet, TextInput, Switch } from "react-native";
import { FormData } from "../../../types/reportTypes";

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
  // Helper functions to update nested objects and arrays
  const updateReporterInfo = (field: string, value: string) => {
    updateFormData("reporter_info", {
      ...formData.reporter_info,
      [field]: value,
    });
  };

  const addVictim = () => {
    const newVictim = { name: "", contact: "" };
    updateFormData("victims", [...(formData.victims || []), newVictim]);
  };
  const updateVictim = (index: number, field: string, value: string) => {
    const updatedVictims = [...(formData.victims || [])];
    updatedVictims[index] = { ...updatedVictims[index], [field]: value };
    updateFormData("victims", updatedVictims);
  };

  const addSuspect = () => {
    const newSuspect = { description: "", vehicle: "" };
    updateFormData("suspects", [...(formData.suspects || []), newSuspect]);
  };

  const updateSuspect = (index: number, field: string, value: string) => {
    const updatedSuspects = [...(formData.suspects || [])];
    updatedSuspects[index] = { ...updatedSuspects[index], [field]: value };
    updateFormData("suspects", updatedSuspects);
  };

  const addWitness = () => {
    const newWitness = { info: "" };
    updateFormData("witnesses", [...(formData.witnesses || []), newWitness]);
  };

  const updateWitness = (index: number, value: string) => {
    const updatedWitnesses = [...(formData.witnesses || [])];
    updatedWitnesses[index] = { info: value };
    updateFormData("witnesses", updatedWitnesses);
  };
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
            value={formData.reporter_info?.name || ""}
            onChangeText={(text) => updateReporterInfo("name", text)}
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
            value={formData.reporter_info?.phone || ""}
            onChangeText={(text) => updateReporterInfo("phone", text)}
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
            value={formData.reporter_info?.email || ""}
            onChangeText={(text) => updateReporterInfo("email", text)}
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
              value={formData.is_victim_reporter}
              onValueChange={(value) =>
                updateFormData("is_victim_reporter", value)
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
      <Text> </Text>
      {/* Victim Information - conditional */}
      {!formData.is_victim_reporter && (
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
              value={formData.victims?.[0]?.name || ""}
              onChangeText={(text) => {
                if (!formData.victims?.length) {
                  addVictim();
                }
                updateVictim(0, "name", text);
              }}
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
              value={formData.victims?.[0]?.contact || ""}
              onChangeText={(text) => {
                if (!formData.victims?.length) {
                  addVictim();
                }
                updateVictim(0, "contact", text);
              }}
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
            value={formData.suspects?.[0]?.description || ""}
            onChangeText={(text) => {
              if (!formData.suspects?.length) {
                addSuspect();
              }
              updateSuspect(0, "description", text);
            }}
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
            value={formData.suspects?.[0]?.vehicle || ""}
            onChangeText={(text) => {
              if (!formData.suspects?.length) {
                addSuspect();
              }
              updateSuspect(0, "vehicle", text);
            }}
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
          value={formData.witnesses?.[0]?.info || ""}
          onChangeText={(text) => {
            if (!formData.witnesses?.length) {
              addWitness();
            }
            updateWitness(0, text);
          }}
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
