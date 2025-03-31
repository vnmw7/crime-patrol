import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

type MapViewComponentProps = {
  mapRef: React.RefObject<MapView>;
  theme: any;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  stations: any[]; // Using any[] for simplicity
  isEmergencyRespondent: (item: any) => boolean;
  onMarkerPress: (station: any) => void;
  getUserLocation: () => void;
  fitMapToStations: () => void;
};

const MapViewComponent = ({
  mapRef,
  theme,
  region,
  stations,
  isEmergencyRespondent,
  onMarkerPress,
  getUserLocation,
  fitMapToStations,
}: MapViewComponentProps) => {
  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onMapReady={fitMapToStations}
      >
        {/* Render Station Markers */}
        {stations.map((station) => {
          const isEmergency = isEmergencyRespondent(station);

          return (
            <Marker
              key={station.id}
              coordinate={station.location}
              title={station.name}
              description={station.address}
              pinColor={isEmergency ? "red" : "blue"}
              onPress={() => !isEmergency && onMarkerPress(station)}
            >
              <Callout tooltip>
                <View
                  style={[
                    styles.calloutContainer,
                    {
                      backgroundColor: theme.calloutBackground,
                      borderColor: theme.calloutBorder,
                    },
                  ]}
                >
                  <Text style={[styles.calloutTitle, { color: theme.text }]}>
                    {station.name}
                  </Text>
                  <Text
                    style={[
                      styles.calloutDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {station.address}
                  </Text>
                  <Text style={[styles.calloutPhone, { color: theme.primary }]}>
                    {station.contactNumbers[0]}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[
            styles.mapButton,
            { backgroundColor: theme.mapControlBackground },
          ]}
          onPress={getUserLocation}
        >
          <Ionicons name="locate" size={24} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapButton,
            { backgroundColor: theme.mapControlBackground },
          ]}
          onPress={fitMapToStations}
        >
          <Ionicons name="expand" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "transparent",
  },
  mapButton: {
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  calloutPhone: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default MapViewComponent;
