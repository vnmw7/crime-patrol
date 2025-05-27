// filepath: c:\\projects\\crime-patrol\\Mobile\\app\\(stack)\\report-details.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Databases, Models } from "appwrite";
import {
  client,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
} from "../../lib/appwrite";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Interface for the report data, similar to report-incident.tsx and my-reports.tsx
interface ReportDetails extends Models.Document {
  Incident_Type: string;
  Incident_Date: string;
  Incident_Time: string;
  Is_In_Progress: boolean;
  Description: string;
  Location: string;
  Location_Type: string;
  Location_Details?: string;
  Reporter_Name: string;
  Reporter_Phone: string;
  Reporter_Email?: string;
  Is_Victim_Reporter?: boolean;
  Victim_Name?: string;
  Victim_Contact?: string;
  Suspect_Description?: string;
  Suspect_Vehicle?: string;
  Witness_Info?: string;
  // Add any other fields that might be present
  [key: string]: any;
}

const ReportDetailsScreen = () => {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing.");
      setLoading(false);
      return;
    }

    if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
      setError("Appwrite database or collection ID is not configured.");
      setLoading(false);
      return;
    }

    const fetchReportDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const databases = new Databases(client);
        const response = await databases.getDocument<ReportDetails>(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ID,
          reportId,
        );
        setReport(response);
      } catch (e: any) {
        console.error("Failed to fetch report details:", e);
        setError(
          e.message || "Failed to load report details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const renderDetailItem = (
    label: string,
    value: string | undefined | null | boolean,
    isBoolean: boolean = false,
  ) => {
    if (value === undefined || value === null || value === "") return null;
    const displayValue = isBoolean ? (value ? "Yes" : "No") : String(value);
    return (
      <View style={styles.detailItem}>
        <Text style={[styles.detailLabel, { color: colors.text }]}>
          {label}:
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {displayValue}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading report details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.notification}
        />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.card }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="document-outline" size={48} color={colors.text} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Report not found.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.card }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: "Report Details", headerBackTitle: "Reports" }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Incident Information
          </Text>
          {renderDetailItem("Incident Type", report.Incident_Type)}
          {renderDetailItem(
            "Date",
            new Date(report.Incident_Date).toLocaleDateString(),
          )}
          {renderDetailItem(
            "Time",
            new Date(report.Incident_Time).toLocaleTimeString(),
          )}
          {renderDetailItem("Is In Progress?", report.Is_In_Progress, true)}
          {renderDetailItem("Description", report.Description)}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Location Information
          </Text>
          {renderDetailItem("Location", report.Location)}
          {renderDetailItem("Location Type", report.Location_Type)}
          {renderDetailItem("Location Details", report.Location_Details)}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            People Involved
          </Text>
          {renderDetailItem("Reporter Name", report.Reporter_Name)}
          {renderDetailItem("Reporter Phone", report.Reporter_Phone)}
          {renderDetailItem("Reporter Email", report.Reporter_Email)}
          {renderDetailItem(
            "Is Reporter the Victim?",
            report.Is_Victim_Reporter,
            true,
          )}
          {renderDetailItem("Victim Name", report.Victim_Name)}
          {renderDetailItem("Victim Contact", report.Victim_Contact)}
          {renderDetailItem("Suspect Description", report.Suspect_Description)}
          {renderDetailItem("Suspect Vehicle", report.Suspect_Vehicle)}
          {renderDetailItem("Witness Information", report.Witness_Info)}
        </View>

        {/* Add other sections as needed, e.g., Property/Media, if they are part of your Appwrite document */}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginRight: 8,
    flexShrink: 1, // Prevents label from pushing value off-screen
  },
  detailValue: {
    fontSize: 15,
    flex: 1, // Allows value to take remaining space and wrap
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReportDetailsScreen;
