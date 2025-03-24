import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Stack, useRouter } from "expo-router";

// Mock incident types
const INCIDENT_TYPES = [
  "Robbery",
  "Assault",
  "Theft",
  "Vandalism",
  "Suspicious Activity",
  "Traffic Incident",
  "Fire",
  "Medical Emergency",
  "Noise Complaint",
  "Other"
];

// Mock location - in real app, would use device GPS
const MOCK_LOCATION = "123 Main Street, Anytown, USA";

const ReportScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  
  // State for report form data
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(MOCK_LOCATION);
  const [mediaAttached, setMediaAttached] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle going back
  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  // Toggle incident type selector
  const toggleTypeSelector = () => {
    triggerHaptic();
    setShowTypeSelector(!showTypeSelector);
  };

  // Select incident type
  const selectIncidentType = (type) => {
    triggerHaptic();
    setIncidentType(type);
    setShowTypeSelector(false);
  };

  // Add media attachment
  const handleAttachMedia = (type) => {
    triggerHaptic();
    console.log(`Attaching ${type}`);
    // In a real app, this would trigger camera/gallery/recording
    setMediaAttached(true);
  };

  // Submit the report
  const handleSubmit = async () => {
    if (!incidentType || !description) {
      triggerHaptic();
      alert("Please fill in all required fields");
      return;
    }

    triggerHaptic();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Report submitted successfully!");
      router.back();
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <StatusBar style="dark" />
      
      {/* Custom Header - Instagram Style */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Incident</Text>
        <View style={{width: 24}} /> {/* Empty view for spacing */}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instagram-like Form Card */}
        <View style={styles.formCard}>
          {/* Progress Indicator - Like Instagram Stories */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, incidentType ? styles.progressActive : null]} />
            <View style={[styles.progressBar, description ? styles.progressActive : null]} />
            <View style={[styles.progressBar, mediaAttached ? styles.progressActive : null]} />
          </View>

          {/* Incident Type Field */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              Incident Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.typeSelector}
              onPress={toggleTypeSelector}
              activeOpacity={0.8}
            >
              <Text style={incidentType ? styles.selectedText : styles.placeholderText}>
                {incidentType || "Select incident type"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#8E8E8E" />
            </TouchableOpacity>

            {/* Incident Type Selector Dropdown */}
            {showTypeSelector && (
              <View style={styles.typeSelectorDropdown}>
                <ScrollView nestedScrollEnabled={true} style={{maxHeight: 180}}>
                  {INCIDENT_TYPES.map((type, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.typeOption}
                      onPress={() => selectIncidentType(type)}
                    >
                      <Text style={styles.typeOptionText}>{type}</Text>
                      {incidentType === type && (
                        <Ionicons name="checkmark" size={20} color="#0095F6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Description Field */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe what happened..."
              placeholderTextColor="#8E8E8E"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Location Field */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#0095F6" style={styles.locationIcon} />
              <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
                placeholderTextColor="#8E8E8E"
              />
              <TouchableOpacity 
                style={styles.gpsButton}
                onPress={() => {
                  triggerHaptic();
                  // In a real app, this would get current GPS coordinates
                  console.log("Getting GPS location");
                }}
              >
                <Ionicons name="locate" size={20} color="#0095F6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Media Attachments */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Attach Media</Text>
            <View style={styles.mediaButtonsContainer}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => handleAttachMedia("photo")}
              >
                <Ionicons name="camera" size={24} color="#0095F6" />
                <Text style={styles.mediaButtonText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => handleAttachMedia("video")}
              >
                <Ionicons name="videocam" size={24} color="#0095F6" />
                <Text style={styles.mediaButtonText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => handleAttachMedia("audio")}
              >
                <FontAwesome5 name="microphone" size={24} color="#0095F6" />
                <Text style={styles.mediaButtonText}>Audio</Text>
              </TouchableOpacity>
            </View>

            {/* Mock Media Preview (would come from camera/gallery) */}
            {mediaAttached && (
              <View style={styles.mediaPreviewContainer}>
                <Image 
                  source={require('../../assets/images/partial-react-logo.png')}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={() => {
                    triggerHaptic();
                    setMediaAttached(false);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* User Notice */}
          <View style={styles.noticeContainer}>
            <MaterialIcons name="info" size={20} color="#8E8E8E" />
            <Text style={styles.noticeText}>
              Your report will be processed and shared with relevant authorities. False reporting is prohibited.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button - Instagram Style */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (!incidentType || !description) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!incidentType || !description || isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Instagram background color
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DBDBDB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#DBDBDB",
    padding: 16,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: "#DBDBDB",
    marginHorizontal: 2,
  },
  progressActive: {
    backgroundColor: "#0095F6",
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#FF3B30",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  placeholderText: {
    color: "#8E8E8E",
  },
  selectedText: {
    color: "#262626",
  },
  typeSelectorDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
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
  typeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEFEF",
  },
  typeOptionText: {
    color: "#262626",
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#262626",
    height: 120,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#262626",
  },
  gpsButton: {
    padding: 8,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  mediaButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#262626",
  },
  mediaPreviewContainer: {
    marginTop: 12,
    position: "relative",
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 4,
    backgroundColor: "#EFEFEF",
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 4,
  },
  noticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#8E8E8E",
  },
  submitContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#DBDBDB",
  },
  submitButton: {
    backgroundColor: "#0095F6", // Instagram blue
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#B2DFFC", // Lighter blue when disabled
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ReportScreen;