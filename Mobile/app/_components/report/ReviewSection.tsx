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
          <Text> </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.incident_type}
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Date & Time:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.incident_date.toLocaleDateString()} at
            <Text> </Text>
            {formData.incident_time.toLocaleTimeString([], {
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
        </View>
        <Text> </Text>
        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            Location
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Address:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.location?.address || "No address provided"}
          </Text>

          {formData.location?.type && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Type:
              </Text>
              <Text> </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.location.type}
              </Text>
            </>
          )}

          {formData.location?.details && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Details:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.location.details}
              </Text>
            </>
          )}
        </View>
        <Text> </Text>
        <View style={styles.reviewSection}>
          <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
            People Involved
          </Text>
          <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
            Reporter:
          </Text>
          <Text style={[styles.reviewValue, { color: theme.text }]}>
            {formData.reporter_info?.name || "No name provided"}
            {formData.reporter_info?.phone
              ? ` | ${formData.reporter_info.phone}`
              : ""}
          </Text>

          {formData.reporter_info?.email && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Email:
              </Text>
              <Text style={[styles.reviewValue, { color: theme.text }]}>
                {formData.reporter_info.email}
              </Text>
            </>
          )}

          {!formData.is_victim_reporter &&
            formData.victims &&
            formData.victims.length > 0 && (
              <>
                <Text
                  style={[styles.reviewLabel, { color: theme.textSecondary }]}
                >
                  Victims:
                </Text>
                {formData.victims.map((victim, index) => (
                  <Text
                    key={index}
                    style={[styles.reviewValue, { color: theme.text }]}
                  >
                    {victim.name || `Victim ${index + 1}`}
                    {victim.contact ? ` | ${victim.contact}` : ""}
                  </Text>
                ))}
              </>
            )}

          {formData.suspects && formData.suspects.length > 0 && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Suspects:
              </Text>
              {formData.suspects.map((suspect, index) => (
                <View key={index}>
                  {suspect.description && (
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                      Description: {suspect.description}
                    </Text>
                  )}
                  {suspect.vehicle && (
                    <Text style={[styles.reviewValue, { color: theme.text }]}>
                      Vehicle: {suspect.vehicle}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}

          {formData.witnesses && formData.witnesses.length > 0 && (
            <>
              <Text
                style={[styles.reviewLabel, { color: theme.textSecondary }]}
              >
                Witnesses:
              </Text>
              {formData.witnesses.map((witness, index) => (
                <Text
                  key={index}
                  style={[styles.reviewValue, { color: theme.text }]}
                >
                  {witness.info || `Witness ${index + 1}`}
                </Text>
              ))}
            </>
          )}
        </View>
        <Text> </Text>{" "}
        {formData.media && formData.media.length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
              Evidence and Media
            </Text>
            <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>
              Media Attached:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              Yes ({formData.media.length} item
              {formData.media.length !== 1 ? "s" : ""})
            </Text>
            {formData.media.map((item, index) => (
              <View key={index} style={styles.mediaReviewItem}>
                <Text
                  style={[
                    styles.reviewValue,
                    { color: theme.text, marginLeft: 12 },
                  ]}
                >
                  • {item.file_name_original} ({item.media_type})
                </Text>
                {item.isUploaded === false && (
                  <Text
                    style={[
                      styles.uploadStatusText,
                      { color: theme.textSecondary, marginLeft: 12 },
                    ]}
                  >
                    Ready to upload on submission
                  </Text>
                )}
              </View>
            ))}
            {formData.media.some((item) => item.isUploaded === false) && (
              <View
                style={[
                  styles.uploadNoticeBox,
                  {
                    backgroundColor: theme.progressBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <MaterialIcons
                  name="cloud-upload"
                  size={16}
                  color={theme.primary}
                />
                <Text
                  style={[
                    styles.uploadNoticeText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Media files will be uploaded securely when you submit this
                  report
                </Text>
              </View>
            )}
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
  mediaReviewItem: {
    marginBottom: 8,
  },
  uploadStatusText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  uploadNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  uploadNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ReviewSection;
