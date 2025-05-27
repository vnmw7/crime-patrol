import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type ViewToggleControlsProps = {
  theme: any;
  viewMode: "list" | "map";
  setViewMode: (mode: "list" | "map") => void;
  showEmergencyRespondents: boolean;
  setShowEmergencyRespondents: (show: boolean) => void;
  fitMapToStations?: () => void;
};

const ViewToggleControls = ({
  theme,
  viewMode,
  setViewMode,
  showEmergencyRespondents,
  setShowEmergencyRespondents,
  fitMapToStations,
}: ViewToggleControlsProps) => {
  return (
    <View style={styles.controlsContainer}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === "list" && [
              styles.activeViewToggleButton,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("list");
          }}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewMode === "list" ? "#FFFFFF" : theme.text}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewMode === "list" ? "#FFFFFF" : theme.text },
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === "map" && [
              styles.activeViewToggleButton,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("map");
            // Ensure map fits all stations when switching to map view
            if (fitMapToStations) {
              setTimeout(fitMapToStations, 300);
            }
          }}
        >
          <Ionicons
            name="map"
            size={20}
            color={viewMode === "map" ? "#FFFFFF" : theme.text}
          />
          <Text
            style={[
              styles.viewToggleText,
              { color: viewMode === "map" ? "#FFFFFF" : theme.text },
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency respondents toggle */}
      <TouchableOpacity
        style={[
          styles.emergencyToggle,
          showEmergencyRespondents && [
            styles.activeEmergencyToggle,
            { backgroundColor: theme.secondary },
          ],
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowEmergencyRespondents(!showEmergencyRespondents);
        }}
      >
        <MaterialCommunityIcons
          name="ambulance"
          size={16}
          color={showEmergencyRespondents ? "#FFFFFF" : theme.secondary}
        />
        <Text
          style={[
            styles.emergencyToggleText,
            {
              color: showEmergencyRespondents ? "#FFFFFF" : theme.secondary,
            },
          ]}
        >
          Emergency
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeViewToggleButton: {
    backgroundColor: "#0095F6",
  },
  viewToggleText: {
    marginLeft: 4,
    fontWeight: "600",
  },
  emergencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  activeEmergencyToggle: {
    backgroundColor: "#FF3B30",
    borderColor: "transparent",
  },
  emergencyToggleText: {
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 12,
  },
});

export default ViewToggleControls;
