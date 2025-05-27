import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type StationDetailsModalProps = {
  visible: boolean;
  station: any; // Using any for simplicity
  theme: any;
  colorScheme: string;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onCall: (phoneNumber: string) => void;
  onDirections: (station: any) => void;
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => number | null;
};

const StationDetailsModal = ({
  visible,
  station,
  theme,
  colorScheme,
  userLocation,
  onClose,
  onCall,
  onDirections,
  calculateDistance,
}: StationDetailsModalProps) => {
  if (!station) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.modalBlur}>
        <View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: theme.card,
              shadowColor: colorScheme === "dark" ? "#000" : "#333",
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {station.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailsContent}>
              <View style={styles.detailsItem}>
                <Ionicons
                  name="location"
                  size={24}
                  color={theme.textSecondary}
                />
                <Text style={[styles.detailsText, { color: theme.text }]}>
                  {station.address}
                </Text>
              </View>

              <View style={styles.detailsItem}>
                <Ionicons
                  name="business"
                  size={24}
                  color={theme.textSecondary}
                />
                <Text style={[styles.detailsText, { color: theme.text }]}>
                  Barangay {station.barangay}
                </Text>
              </View>

              <View
                style={[
                  styles.contactSection,
                  { borderTopColor: theme.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Contact Information
                </Text>

                {station.contactNumbers.map((number: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactItem}
                    onPress={() => onCall(number)}
                  >
                    <Ionicons name="call" size={20} color={theme.primary} />
                    <Text
                      style={[styles.contactItemText, { color: theme.primary }]}
                    >
                      {number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={[styles.mapSection, { borderTopColor: theme.border }]}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Location
                </Text>

                <View style={styles.miniMapContainer}>
                  <MapView
                    style={styles.miniMap}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker coordinate={station.location} pinColor="blue" />
                  </MapView>
                </View>

                {userLocation && (
                  <View style={styles.distanceInfo}>
                    <Ionicons
                      name="navigate"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[styles.distanceInfoText, { color: theme.text }]}
                    >
                      {calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        station.location.latitude,
                        station.location.longitude,
                      )?.toFixed(2)}{" "}
                      km away from your location
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.servicesSection,
                  { borderTopColor: theme.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Services
                </Text>

                <View style={styles.servicesList}>
                  <View style={styles.serviceItem}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.serviceText, { color: theme.text }]}>
                      File a Police Report
                    </Text>
                  </View>

                  <View style={styles.serviceItem}>
                    <Ionicons
                      name="shield"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.serviceText, { color: theme.text }]}>
                      Police Assistance
                    </Text>
                  </View>

                  <View style={styles.serviceItem}>
                    <Ionicons
                      name="finger-print"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.serviceText, { color: theme.text }]}>
                      Criminal Investigation
                    </Text>
                  </View>

                  <View style={styles.serviceItem}>
                    <Ionicons
                      name="people"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.serviceText, { color: theme.text }]}>
                      Community Service
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                onClose();
                onCall(station.contactNumbers[0]);
              }}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.footerButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.tertiary }]}
              onPress={() => {
                onClose();
                onDirections(station);
              }}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.footerButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  detailsContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
  },
  detailsContent: {
    marginBottom: 16,
  },
  detailsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailsText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  contactSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  mapSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  miniMapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  servicesSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0.5,
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceText: {
    marginLeft: 10,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 16,
  },
});

export default StationDetailsModal;
