import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

type StationCardProps = {
  item: any; // Using any for simplicity, could be refined to PoliceStationType | EmergencyRespondentType
  theme: any;
  distance: number | null;
  isEmergency: boolean;
  onCardPress: () => void;
  onCallPress: (phoneNumber: string) => void;
  onDirectionsPress: () => void;
};

const StationCard = ({
  item,
  theme,
  distance,
  isEmergency,
  onCardPress,
  onCallPress,
  onDirectionsPress,
}: StationCardProps) => {
  const cardStyles = [
    styles.stationCard,
    { backgroundColor: theme.card, borderColor: theme.border },
    isEmergency && styles.emergencyCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onCardPress}
      activeOpacity={0.7}
    >
      <View style={styles.stationCardHeader}>
        <View style={styles.stationNameContainer}>
          <View style={styles.stationIcon}>
            {isEmergency ? (
              <MaterialCommunityIcons
                name="ambulance"
                size={20}
                color={theme.secondary}
              />
            ) : (
              <MaterialIcons
                name="local-police"
                size={20}
                color={theme.primary}
              />
            )}
          </View>
          <Text
            style={[
              styles.stationName,
              { color: theme.text },
              isEmergency && { color: theme.secondary },
            ]}
          >
            {item.name}
          </Text>
        </View>
        {distance !== null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {distance < 1
                ? `${(distance * 1000).toFixed(0)}m`
                : `${distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.addressContainer}>
        <Ionicons
          name="location-outline"
          size={16}
          color={theme.textSecondary}
        />
        <Text style={[styles.addressText, { color: theme.textSecondary }]}>
          {item.address}
        </Text>
      </View>

      <View style={styles.contactContainer}>
        <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.contactText, { color: theme.textSecondary }]}>
          {item.contactNumbers[0]}
          {item.contactNumbers.length > 1 &&
            ` +${item.contactNumbers.length - 1} more`}
        </Text>
      </View>

      <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCallPress(item.contactNumbers[0])}
        >
          <Ionicons name="call" size={20} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.primary }]}>
            Call
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.actionDivider, { backgroundColor: theme.border }]}
        />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDirectionsPress}
        >
          <Ionicons name="navigate" size={20} color={theme.tertiary} />
          <Text style={[styles.actionText, { color: theme.tertiary }]}>
            Directions
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  stationCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  stationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stationNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stationIcon: {
    marginRight: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  actionDivider: {
    width: 1,
    height: "100%",
  },
});

export default StationCard;
