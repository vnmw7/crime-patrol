import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FormData } from "../../../types/reportTypes";

interface ReviewSectionProps {
  formData: FormData;
  theme: any;
  colorScheme: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formData,
  theme,
  colorScheme,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Review and Submit
      </Text>

      <View
        style={[styles.reviewCard, { backgroundColor: theme.inputBackground }]}
      >
        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            Incident Information
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Type:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.Incident_Type}
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Date & Time:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.Incident_Date.toLocaleDateString()} at{" "}
            {formData.Incident_Time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Description:
          </Text>{" "}
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.Description}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            Location
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Address:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.Location}
          </Text>

          {formData.Location_Type && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Type:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Location_Type}
              </Text>
            </>
          )}

          {formData.Location_Details && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Details:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Location_Details}
              </Text>
            </>
          )}
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            People Involved
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Reporter:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.Reporter_Name} | {formData.Reporter_Name}
            {formData.Reporter_Phone ? ` | ${formData.Reporter_Phone}` : ""}
          </Text>

          {!formData.Is_Victim_Reporter && formData.Is_Victim_Reporter && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Victim:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Victim_Name}
                {formData.Victim_Contact ? ` | ${formData.Victim_Contact}` : ""}
              </Text>
            </>
          )}

          {formData.Suspect_Description && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Suspect:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Suspect_Description}
              </Text>
            </>
          )}

          {formData.Suspect_Vehicle && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Suspect Vehicle:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Suspect_Vehicle}
              </Text>
            </>
          )}

          {formData.Witness_Info && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Witnesses:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.Witness_Info}
              </Text>
            </>
          )}
        </View>

        {formData.Media_Attached && (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
              Evidence and Media
            </Text>
            <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
              Media Attached:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              Yes (1 item)
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.disclaimerBox,
          {
            backgroundColor: colorScheme === "dark" ? "#2C2C2C" : "#F8F8F8",
            borderColor: theme.border,
          },
        ]}
      >
        <MaterialIcons name="info" size={20} color={theme.textSecondary} />
        <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          By submitting this report, you confirm that the information provided
          is accurate to the best of your knowledge. False reporting is a
          criminal offense.
        </Text>
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
  reviewCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reviewSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  reviewSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
    marginBottom: 12,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ReviewSection;
