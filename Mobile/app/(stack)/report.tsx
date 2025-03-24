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
  ActivityIndicator,
  useColorScheme,
  Animated
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Stack, useRouter } from "expo-router";

// App theme colors - matching with index.tsx
const themeColors = {
  light: {
    primary: "#0095F6", // Instagram blue as primary color
    secondary: "#FF3B30", // Red for danger/emergency
    tertiary: "#007AFF", // Blue for secondary actions
    background: "#FAFAFA", // Light background
    card: "#FFFFFF", // White card background
    text: "#262626", // Dark text
    textSecondary: "#8E8E8E", // Gray secondary text
    border: "#DBDBDB", // Light gray border
    inactiveTab: "#8E8E8E", // Inactive tab color
    inputBackground: "#F2F2F2", // Light gray for input backgrounds
    progressBackground: "#DBDBDB" // Light gray for progress bars
  },
  dark: {
    primary: "#0095F6", // Keep Instagram blue as primary
    secondary: "#FF453A", // Slightly adjusted red for dark mode
    tertiary: "#0A84FF", // Adjusted blue for dark mode
    background: "#121212", // Dark background
    card: "#1E1E1E", // Dark card background
    text: "#FFFFFF", // White text
    textSecondary: "#ABABAB", // Light gray secondary text
    border: "#2C2C2C", // Dark gray border
    inactiveTab: "#6E6E6E", // Inactive tab color for dark mode
    inputBackground: "#2C2C2C", // Dark gray for input backgrounds
    progressBackground: "#3D3D3D" // Darker gray for progress bars
  }
};

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
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // State for report form data
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(MOCK_LOCATION);
  const [mediaAttached, setMediaAttached] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values for interaction feedback
  const typeSelectorScale = useRef(new Animated.Value(1)).current;
  const submitButtonScale = useRef(new Animated.Value(1)).current;
  const mediaButtonsScale = useRef(new Animated.Value(1)).current;

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle going back with animation
  const handleBack = () => {
    triggerHaptic();
    Animated.timing(typeSelectorScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  // Toggle incident type selector with animation
  const toggleTypeSelector = () => {
    triggerHaptic();
    
    // Add animation for feedback
    Animated.sequence([
      Animated.timing(typeSelectorScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(typeSelectorScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowTypeSelector(!showTypeSelector);
  };

  // Select incident type
  const selectIncidentType = (type) => {
    triggerHaptic();
    setIncidentType(type);
    setShowTypeSelector(false);
  };

  // Add media attachment with animation
  const handleAttachMedia = (type) => {
    triggerHaptic();
    
    // Add animation for feedback
    Animated.sequence([
      Animated.timing(mediaButtonsScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(mediaButtonsScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    console.log(`Attaching ${type}`);
    // In a real app, this would trigger camera/gallery/recording
    setMediaAttached(true);
  };

  // Submit the report with animation
  const handleSubmit = async () => {
    if (!incidentType || !description) {
      triggerHaptic();
      alert("Please fill in all required fields");
      return;
    }

    triggerHaptic();
    
    // Add animation for feedback
    Animated.sequence([
      Animated.timing(submitButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Report submitted successfully!");
      router.back();
    }, 2000);
  };

  // Calculate how many steps are complete for progress indicator
  const calculateProgress = () => {
    let progress = 0;
    if (incidentType) progress++;
    if (description) progress++;
    if (mediaAttached) progress++;
    return progress;
  };

  const progress = calculateProgress();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { 
        paddingTop: insets.top,
        backgroundColor: theme.background
      }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} />
      
      {/* Custom Header - Instagram Style */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { 
        borderBottomColor: theme.border,
        backgroundColor: theme.card
      }]}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Report an Incident</Text>
        <View style={{width: 24}} /> {/* Empty view for spacing */}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instagram-like Form Card */}
        <View style={[styles.formCard, { 
          backgroundColor: theme.card,
          borderColor: theme.border
        }]}>
          {/* Progress Indicator - Like Instagram Stories */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]} />
            <View style={[
              styles.progressBarFill, 
              { width: `${(progress / 3) * 100}%`, backgroundColor: theme.primary }
            ]} />
          </View>

          {/* Incident Type Field */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Incident Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Animated.View style={{ transform: [{ scale: typeSelectorScale }] }}>
              <TouchableOpacity 
                style={[styles.typeSelector, { 
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground
                }]}
                onPress={toggleTypeSelector}
                activeOpacity={0.8}
                accessibilityLabel="Select incident type"
                accessibilityRole="button"
                accessibilityHint="Opens a dropdown to select the type of incident"
              >
                <Text style={[
                  incidentType ? { color: theme.text } : { color: theme.textSecondary }
                ]}>
                  {incidentType || "Select incident type"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </Animated.View>

            {/* Incident Type Selector Dropdown */}
            {showTypeSelector && (
              <View style={[styles.typeSelectorDropdown, { 
                borderColor: theme.border,
                backgroundColor: theme.card,
                ...Platform.select({
                  ios: {
                    shadowColor: colorScheme === 'dark' ? "#000" : "#555",
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              }]}>
                <ScrollView nestedScrollEnabled={true} style={{maxHeight: 180}}>
                  {INCIDENT_TYPES.map((type, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.typeOption, { 
                        borderBottomColor: theme.border
                      }]}
                      onPress={() => selectIncidentType(type)}
                      accessibilityLabel={type}
                      accessibilityRole="menuitem"
                    >
                      <Text style={[styles.typeOptionText, { color: theme.text }]}>{type}</Text>
                      {incidentType === type && (
                        <Ionicons name="checkmark" size={20} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Description Field */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.descriptionInput, { 
                borderColor: theme.border,
                backgroundColor: theme.inputBackground,
                color: theme.text
              }]}
              placeholder="Describe what happened..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              accessibilityLabel="Description of the incident"
              accessibilityHint="Enter details about what happened"
            />
          </View>

          {/* Location Field */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
            <View style={[styles.locationContainer, { 
              borderColor: theme.border,
              backgroundColor: theme.inputBackground
            }]}>
              <Ionicons name="location" size={20} color={theme.primary} style={styles.locationIcon} />
              <TextInput
                style={[styles.locationInput, { color: theme.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel="Location of incident"
              />
              <TouchableOpacity 
                style={styles.gpsButton}
                onPress={() => {
                  triggerHaptic();
                  // In a real app, this would get current GPS coordinates
                  console.log("Getting GPS location");
                }}
                accessibilityLabel="Get current location"
                accessibilityRole="button"
              >
                <Ionicons name="locate" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Media Attachments */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Attach Media</Text>
            <Animated.View 
              style={[
                styles.mediaButtonsContainer, 
                { transform: [{ scale: mediaButtonsScale }] }
              ]}
            >
              <TouchableOpacity 
                style={[styles.mediaButton, { 
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground 
                }]}
                onPress={() => handleAttachMedia("photo")}
                accessibilityLabel="Attach photo"
                accessibilityRole="button"
              >
                <Ionicons name="camera" size={24} color={theme.primary} />
                <Text style={[styles.mediaButtonText, { color: theme.text }]}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mediaButton, { 
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground 
                }]}
                onPress={() => handleAttachMedia("video")}
                accessibilityLabel="Attach video"
                accessibilityRole="button"
              >
                <Ionicons name="videocam" size={24} color={theme.primary} />
                <Text style={[styles.mediaButtonText, { color: theme.text }]}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mediaButton, { 
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground 
                }]}
                onPress={() => handleAttachMedia("audio")}
                accessibilityLabel="Attach audio"
                accessibilityRole="button"
              >
                <FontAwesome5 name="microphone" size={24} color={theme.primary} />
                <Text style={[styles.mediaButtonText, { color: theme.text }]}>Audio</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Mock Media Preview (would come from camera/gallery) */}
            {mediaAttached && (
              <View style={styles.mediaPreviewContainer}>
                <Image 
                  source={require('../../assets/images/partial-react-logo.png')}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                  accessibilityLabel="Media preview"
                />
                <TouchableOpacity 
                  style={styles.removeMediaButton}
                  onPress={() => {
                    triggerHaptic();
                    setMediaAttached(false);
                  }}
                  accessibilityLabel="Remove media"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* User Notice */}
          <View style={[styles.noticeContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F8F8F8' 
          }]}>
            <MaterialIcons name="info" size={20} color={theme.textSecondary} />
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Your report will be processed and shared with relevant authorities. False reporting is prohibited.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button - Instagram Style */}
      <View style={[styles.submitContainer, { 
        paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
        borderTopColor: theme.border,
        backgroundColor: theme.card
      }]}>
        <Animated.View style={{ transform: [{ scale: submitButtonScale }] }}>
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              {
                backgroundColor: (!incidentType || !description || isSubmitting) 
                  ? (colorScheme === 'dark' ? '#1E4E7A' : '#B2DFFC') 
                  : theme.primary
              }
            ]}
            onPress={handleSubmit}
            disabled={!incidentType || !description || isSubmitting}
            activeOpacity={0.7}
            accessibilityLabel="Submit report"
            accessibilityRole="button"
            accessibilityState={{ disabled: !incidentType || !description || isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  formCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 16,
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
  progressContainer: {
    height: 4,
    backgroundColor: "transparent",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
  },
  progressBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 2,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  typeSelectorDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    ...Platform.select({
      ios: {
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
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  typeOptionText: {
    fontSize: 15,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 120,
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
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
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  mediaButtonText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  mediaPreviewContainer: {
    marginTop: 12,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaPreview: {
    width: "100%",
    height: 200,
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    padding: 2,
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
  },
  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ReportScreen;