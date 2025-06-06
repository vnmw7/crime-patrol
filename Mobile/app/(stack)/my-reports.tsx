// filepath: c:\\projects\\crime-patrol\\Mobile\\app\\(stack)\\my-reports.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Databases, Models } from "appwrite"; // Import Models, remove Query
import {
  client,
  APPWRITE_DATABASE_ID,
  REPORTS_MAIN_COLLECTION_ID,
} from "../../lib/appwrite"; // Use the main reports collection
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native"; // Or your custom theme hook
import { Ionicons } from "@expo/vector-icons";

// Define an interface for the report data structure from Appwrite (reports_main collection)
// Ensure this matches your Appwrite collection attributes
interface Report extends Models.Document {
  // Extend Models.Document
  incident_type: string;
  incident_date: string; // Assuming date is stored as ISO string
  reported_by: string;
  status?: string; // Optional status field
  // Add other fields as necessary from your normalized database structure
  [key: string]: any; // Allow other properties
}

const MyReportsScreen = () => {
  const router = useRouter();
  const { colors } = useTheme(); // Using react-navigation theme, adapt if using a custom one
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fetchReports = useCallback(async () => {
    if (!APPWRITE_DATABASE_ID || !REPORTS_MAIN_COLLECTION_ID) {
      setError("Appwrite database or collection ID is not configured.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const databases = new Databases(client);
      const response = await databases.listDocuments<Report>(
        APPWRITE_DATABASE_ID,
        REPORTS_MAIN_COLLECTION_ID,
        // Add queries if needed, e.g., to filter by user or sort by date
        // [Query.orderDesc('incident_date')] // Example: order by most recent
      );
      setReports(response.documents);
    } catch (e: any) {
      console.error("Failed to fetch reports:", e);
      setError(e.message || "Failed to fetch reports. Please try again.");
      // It might be useful to show some mock data or a specific error message
      // For example, if (e.code === 401) setError("Unauthorized. Please log in.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleReportPress = (report: Report) => {
    // Navigate to a detailed report view, passing report ID or full object
    router.push(`/report-details?reportId=${report.$id}`);
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      onPress={() => handleReportPress(item)}
      style={[
        styles.reportItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {" "}
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>
          {item.incident_type || "N/A"}
        </Text>
        <Text style={[styles.reportDate, { color: colors.text }]}>
          {item.incident_date
            ? new Date(item.incident_date).toLocaleDateString()
            : "N/A"}
        </Text>
      </View>
      <Text
        style={[styles.reportDescription, { color: colors.text }]}
        numberOfLines={2}
      >
        {/* Note: Description is now in report_metadata collection, not available in main reports */}
        Report details available in full view
      </Text>
      <Text style={[styles.reportLocation, { color: colors.primary }]}>
        {/* Note: Location is now in report_locations collection, not available in main reports */}
        Location details in full view
      </Text>
      {item.status && (
        <Text
          style={[
            styles.reportStatus,
            {
              color: item.status === "Resolved" ? "green" : colors.notification,
            },
          ]}
        >
          Status: {item.status}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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
          Loading reports...
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
          onPress={fetchReports}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.retryButtonText, { color: colors.card }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="file-tray-outline" size={48} color={colors.text} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          You have no reports yet.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/report-incident")}
          style={[styles.newReportButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.newReportButtonText, { color: colors.card }]}>
            File a New Report
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      renderItem={renderReportItem}
      keyExtractor={(item) => item.$id}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.listContentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    />
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
  listContentContainer: {
    padding: 16,
  },
  reportItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  reportDate: {
    fontSize: 13,
  },
  reportDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportLocation: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  reportStatus: {
    fontSize: 13,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  newReportButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  newReportButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyReportsScreen;
