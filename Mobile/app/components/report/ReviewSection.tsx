import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FormData } from "../../types/reportTypes";

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
            {formData.incidentType}
          </Text>

          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Date & Time:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.incidentDate.toLocaleDateString()} at{" "}
            {formData.incidentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Description:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.description}
          </Text>

          {formData.weaponsInvolved && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Weapons:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.weaponsDescription || "Yes (no details provided)"}
              </Text>
            </>
          )}
        </View>

        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            Location
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Address:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.location}
          </Text>

          {formData.locationType && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Type:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.locationType}
              </Text>
            </>
          )}

          {formData.locationDetails && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Details:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.locationDetails}
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
            {formData.reporterName} | {formData.reporterPhone}
            {formData.reporterEmail ? ` | ${formData.reporterEmail}` : ""}
          </Text>

          {!formData.isVictimReporter && formData.victimName && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Victim:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.victimName}
                {formData.victimContact ? ` | ${formData.victimContact}` : ""}
              </Text>
            </>
          )}

          {formData.suspectDescription && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Suspect:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.suspectDescription}
              </Text>
            </>
          )}

          {formData.suspectVehicle && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Suspect Vehicle:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.suspectVehicle}
              </Text>
            </>
          )}

          {formData.witnessInfo && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Witnesses:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.witnessInfo}
              </Text>
            </>
          )}
        </View>

        {formData.propertyInvolved && (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
              Property Information
            </Text>
            {formData.propertyDescription && (
              <>
                <Text
                  style={[styles.reviewLabel, { color: theme.textSecondary }]}
                >
                  Description:
                </Text>
                <Text style={[styles.reviewValue, { color: theme.text }]}>
                  {formData.propertyDescription}
                </Text>
              </>
            )}

            {formData.propertyValue && (
              <>
                <Text
                  style={[styles.reviewLabel, { color: theme.textSecondary }]}
                >
                  Value:
                </Text>
                <Text style={[styles.reviewValue, { color: theme.text }]}>
                  ${formData.propertyValue}
                </Text>
              </>
            )}

            {formData.serialNumbers && (
              <>
                <Text
                  style={[styles.reviewLabel, { color: theme.textSecondary }]}
                >
                  Serial Numbers:
                </Text>
                <Text style={[styles.reviewValue, { color: theme.text }]}>
                  {formData.serialNumbers}
                </Text>
              </>
            )}
          </View>
        )}

        {formData.mediaAttached && (
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
