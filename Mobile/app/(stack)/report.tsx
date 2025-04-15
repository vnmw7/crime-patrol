import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  useColorScheme,
  Animated,
  Alert,
  Linking,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { submitReport } from "../../lib/appwrite";

// Import theme
import { themeColors } from "../theme/colors";

// Import components
import IncidentSection from "../../components/report/IncidentSection";
import LocationSection from "../../components/report/LocationSection";
import PeopleSection from "../../components/report/PeopleSection";
import PropertySection from "../../components/report/PropertySection";
import ReviewSection from "../../components/report/ReviewSection";

// Import types and constants
import { FormData } from "../../types/reportTypes";
import { SECTION_TITLES, MOCK_LOCATION } from "../constants/reportConstants";

const ReportScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];

  // Section navigation state
  const [currentSection, setCurrentSection] = useState(0); // State for report form data - comprehensive crime report fields  const [formData, setFormData] = useState<FormData>({

  const [formData, setFormData] = useState<FormData>({
    // Incident Information
    Incident_Type: "",
    Incident_Date: new Date(),
    Incident_Time: new Date(),
    Is_In_Progress: false,
    Description: "",

    // Location Information
    Location: MOCK_LOCATION,
    Location_Type: "",
    Location_Details: "",

    // People Involved
    Reporter_Name: "",
    Reporter_Phone: "",
    Reporter_Email: "",
    Is_Victim_Reporter: true,
    Victim_Name: "",
    Victim_Contact: "",
    Suspect_Description: "",
    Suspect_Vehicle: "",
    Witness_Info: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values for interaction feedback
  const selectorScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const mediaButtonsScale = useRef(new Animated.Value(1)).current;

  // Function to update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Navigation between sections
  const goToNextSection = () => {
    if (validateCurrentSection()) {
      triggerHaptic();

      // Animate transition
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // If this is the emergency section and incident is in progress
      if (currentSection === 0 && formData.Is_In_Progress) {
        Alert.alert(
          "Emergency Alert",
          "If this incident is happening now and requires immediate attention, please call emergency services.",
          [
            {
              text: "Call Emergency",
              onPress: () => Linking.openURL("tel:911"),
            },
            {
              text: "Continue Report",
              onPress: () => {
                setCurrentSection(currentSection + 1);
                scrollToTop();
              },
            },
          ],
        );
      } else {
        // Standard next section
        setCurrentSection(currentSection + 1);
        scrollToTop();
      }
    }
  };

  const goToPrevSection = () => {
    triggerHaptic();

    // Animate transition
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentSection(currentSection - 1);
    scrollToTop();
  };

  // Scroll to top of form
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Generalized validation function
  const validateSection = (
    rules: { field: keyof FormData; message: string }[],
  ) => {
    for (const rule of rules) {
      if (!formData[rule.field]) {
        Alert.alert("Missing Information", rule.message);
        return false;
      }
    }
    return true;
  };

  const validateIncidentSection = () =>
    validateSection([
      { field: "Incident_Type", message: "Please select an incident type" },
      {
        field: "Description",
        message: "Please provide a description of what happened",
      },
    ]);

  const validateLocationSection = () =>
    validateSection([
      { field: "Location", message: "Please enter a location" },
      { field: "Location_Type", message: "Please select a location type" },
    ]);

  const validatePeopleSection = () =>
    validateSection([
      { field: "Reporter_Name", message: "Please enter your name" },
      {
        field: "Reporter_Phone",
        message: "Please enter your phone number for follow-up",
      },
    ]);

  const validateCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return validateIncidentSection();
      case 1:
        return validateLocationSection();
      case 2:
        return validatePeopleSection();
      case 3: // Property Information
        return true; // No mandatory fields for this section
      case 4: // Review
        return true; // Final validation before submit
      default:
        return true;
    }
  };

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle going back with animation
  const handleBack = () => {
    triggerHaptic();
    Animated.timing(selectorScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  // Add media attachment with animation
  const handleAttachMedia = (type: string) => {
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
  };

  // Submit the report with animation
  const handleSubmit = async () => {
    triggerHaptic();

    // Add animation for feedback
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSubmitting(true);

    console.log("Submitting report:", formData);
    await submitReport(formData) // Pass formData directly
      .then(() => {
        setIsSubmitting(false);
        Alert.alert(
          "Report Submitted",
          "Your crime report has been successfully submitted. A case number will be sent to your phone.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
        Alert.alert("Error", "There was an error submitting your report.");
        setIsSubmitting(false);
      });
  };

  // Calculate progress based on current section
  const calculateProgress = () => {
    return (currentSection / 4) * 100; // 5 sections (0-4)
  };

  // Render section-specific progress indicators
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {/* Base progress bar */}
      <View
        style={[
          styles.progressBar,
          { backgroundColor: theme.progressBackground },
        ]}
      />

      {/* Filled progress bar */}
      <View
        style={[
          styles.progressBarFill,
          {
            width: `${calculateProgress()}%`,
            backgroundColor: theme.primary,
          },
        ]}
      />

      {/* Section indicators */}
      <View style={styles.sectionIndicators}>
        {SECTION_TITLES.map((title, index) => (
          <View key={index} style={styles.sectionIndicator}>
            <View
              style={[
                styles.sectionDot,
                {
                  backgroundColor:
                    index <= currentSection
                      ? theme.primary
                      : theme.progressBackground,
                },
              ]}
            />
            <Text
              style={[
                styles.sectionLabel,
                {
                  color:
                    index <= currentSection
                      ? theme.primary
                      : theme.textSecondary,
                  fontWeight: index === currentSection ? "600" : "400",
                },
              ]}
            >
              {title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render different form sections based on currentSection
  const renderSection = (sectionIndex: number) => {
    const commonProps = {
      formData,
      updateFormData: updateFormData as (
        field: string | number | symbol,
        value: any,
      ) => void,
      theme,
      colorScheme: colorScheme || "light",
    };

    switch (sectionIndex) {
      case 0:
        return (
          <IncidentSection
            {...commonProps}
            triggerHaptic={triggerHaptic}
            selectorScale={selectorScale}
          />
        );
      case 1:
        return (
          <LocationSection
            {...commonProps}
            triggerHaptic={triggerHaptic}
            selectorScale={selectorScale}
          />
        );
      case 2:
        return <PeopleSection {...commonProps} />;
      case 3:
        return (
          <PropertySection
            {...commonProps}
            triggerHaptic={triggerHaptic}
            mediaButtonsScale={mediaButtonsScale}
            handleAttachMedia={handleAttachMedia}
          />
        );
      case 4:
        return (
          <ReviewSection
            formData={formData}
            theme={theme}
            colorScheme={colorScheme || "light"}
          />
        );
      default:
        return null;
    }
  };

  // Render the navigation buttons for section navigation
  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {currentSection > 0 && (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.border }]}
            onPress={goToPrevSection}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={theme.text}
              style={styles.buttonIcon}
            />
            <Text style={[styles.backButtonText, { color: theme.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        {currentSection < 4 ? (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={goToNextSection}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Report a Crime",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Progress indicator */}
            {renderProgressIndicator()}

            {/* Current section form fields */}
            {renderSection(currentSection)}
          </View>
        </ScrollView>

        {/* Bottom navigation buttons */}
        <View
          style={[
            styles.submitContainer,
            {
              borderTopColor: theme.border,
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {renderNavigationButtons()}
        </View>
      </KeyboardAvoidingView>
    </>
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
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    marginBottom: 35, // Increased to make room for section indicators
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
  // Section indicators
  sectionIndicators: {
    position: "absolute",
    top: 9, // Position below the progress bar
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  sectionIndicator: {
    alignItems: "center",
    width: 60,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  submitContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 6,
  },
  backButtonText: {
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 6,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginHorizontal: 4,
  },
});

export default ReportScreen;
