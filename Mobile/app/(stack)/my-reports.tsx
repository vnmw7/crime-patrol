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
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { reportService, ReportListItem } from "../../lib/reportService";
import { getCurrentUser } from "../../lib/appwrite";

const MyReportsScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user to filter reports
      const currentUser = await getCurrentUser();
      const userId = currentUser?.$id;

      // Fetch reports using the new service
      const fetchedReports = await reportService.fetchReportsForList(userId);
      setReports(fetchedReports);
    } catch (e: any) {
      console.error("Failed to fetch reports:", e);
      setError(e.message || "Failed to fetch reports. Please try again.");
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

  const handleReportPress = (report: ReportListItem) => {
    // Navigate to a detailed report view, passing report ID
    router.push(`/report-details?reportId=${report.$id}`);
  };

  const renderReportItem = ({ item }: { item: ReportListItem }) => (
    <TouchableOpacity
      onPress={() => handleReportPress(item)}
      style={[
        styles.reportItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
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

      {item.description && (
        <Text
          style={[styles.reportDescription, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      {item.location_address && (
        <Text style={[styles.reportLocation, { color: colors.primary }]}>
          📍 {item.location_address}
        </Text>
      )}

      <View style={styles.reportFooter}>
        <Text
          style={[
            styles.reportStatus,
            {
              color: item.status === "resolved" ? "green" : colors.notification,
            },
          ]}
        >
          Status: {item.status}
        </Text>
        {item.priority_level && (
          <Text style={[styles.reportPriority, { color: colors.text }]}>
            Priority: {item.priority_level}
          </Text>
        )}
      </View>
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
    flex: 1,
  },
  reportDate: {
    fontSize: 13,
    marginLeft: 8,
  },
  reportDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  reportLocation: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportStatus: {
    fontSize: 13,
    fontWeight: "500",
  },
  reportPriority: {
    fontSize: 12,
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
