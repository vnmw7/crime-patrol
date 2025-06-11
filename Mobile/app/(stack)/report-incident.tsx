import React, { useState, useRef, useEffect } from "react";
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
import * as Location from "expo-location";
import {
  submitNormalizedReport,
  getCurrentUser,
  APPWRITE_CRIME_PATROL_BUCKET_ID,
} from "../../lib/appwrite";
import { uploadToCloudinary } from "../../lib/cloudinary"; // Import Cloudinary upload function
import { testAppwriteConnection } from "../../lib/testConnection"; // Add connection test
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

// Import theme
import { themeColors } from "../theme/colors";

// Import components
import IncidentSection from "../_components/report/IncidentSection";
import LocationSection from "../_components/report/LocationSection";
import PeopleSection from "../_components/report/PeopleSection";
import MediaSection from "../_components/report/MediaSection";
import ReviewSection from "../_components/report/ReviewSection";

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
  const [currentSection, setCurrentSection] = useState(0);

  // State for report form data - comprehensive crime report fields
  const [formData, setFormData] = useState<FormData>({
    // Incident Information
    incident_type: "",
    incident_date: new Date(),
    incident_time: new Date(),
    is_in_progress: false,
    description: "",

    location: {
      address: MOCK_LOCATION,
      type: "",
      details: "",
      latitude: undefined,
      longitude: undefined,
    },

    reporter_info: {
      name: "",
      phone: "",
      email: "",
    },
    is_victim_reporter: true,

    // People Involved (arrays to support multiple entries)
    victims: [],
    suspects: [],
    witnesses: [], // Media attachments
    media: [],
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

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
  useEffect(() => {
    (async () => {
      const cameraRollStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const audioRecordingStatus = await Audio.requestPermissionsAsync();
      const locationStatus = await Location.requestForegroundPermissionsAsync(); // Added location permission

      if (cameraRollStatus.status !== "granted") {
        Alert.alert(
          "Permissions Denied",
          "Sorry, we need camera roll permissions to make this work!",
        );
      }
      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Permissions Denied",
          "Sorry, we need camera permissions to make this work!",
        );
      }
      if (audioRecordingStatus.status !== "granted") {
        Alert.alert(
          "Permissions Denied",
          "Sorry, we need microphone permissions for audio recording!",
        );
      }
      if (locationStatus.status !== "granted") {
        // Added check for location permission
        Alert.alert(
          "Permissions Denied",
          "Permission to access location was denied. You can enable it in settings.",
        );
      }

      // Test Appwrite connection
      console.log("Testing Appwrite connection...");
      const connectionResult = await testAppwriteConnection();
      if (!connectionResult.success) {
        console.error(
          "Appwrite connection test failed:",
          connectionResult.error,
        );
      }
    })();
  }, []);

  // Fetch current user's email and populate it in the form
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.email) {
          updateFormData("reporter_info", {
            name: "",
            phone: "",
            email: currentUser.email,
          });
        }
      } catch (error) {
        console.log("Could not fetch user email:", error);
        // Don't show an alert, just continue without email
      }
    };

    fetchUserEmail();
  }, []);

  const fetchAndSetCurrentLocation = async () => {
    triggerHaptic();
    let { status } = await Location.requestForegroundPermissionsAsync(); // Re-check/request if needed
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access location was denied. Please enable it in settings to use this feature.",
      );
      return;
    }

    try {
      // Use dedicated GPS loading state
      setIsLoadingGPS(true);
      Alert.alert(
        "Fetching Location",
        "Getting your current GPS coordinates...",
      );
      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Request high accuracy
      });
      updateFormData("location", {
        ...formData.location,
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
      // Optionally, you could try to reverse geocode here to also update the address field
      // For now, just alerting that coordinates are set.
      Alert.alert(
        "Location Updated",
        `Latitude: ${locationData.coords.latitude.toFixed(5)}, Longitude: ${locationData.coords.longitude.toFixed(5)} has been set. You may still want to verify the street address.`,
      );
    } catch (error: any) {
      console.error("Error getting location", error);
      let errorMessage = "Failed to get current location.";
      if (error.message.includes("Location services are disabled")) {
        errorMessage =
          "Location services are disabled. Please enable them in your device settings.";
      } else if (
        error.message.includes("Permission to access location was denied")
      ) {
        errorMessage =
          "Permission to access location was denied. Please enable it in app settings.";
      }
      Alert.alert("Location Error", errorMessage);
    } finally {
      setIsLoadingGPS(false);
    }
  };
  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Reduced for better performance
      base64: false, // Don't include base64 data
    });

    if (!result.canceled && result.assets) {
      // Store local file for preview - upload will happen on submission
      const localAttachment = {
        file_id: `local_${Date.now()}`,
        media_type: "photo" as const,
        file_name_original:
          result.assets[0].uri.split("/").pop() || "image.jpg",
        display_order: formData.media?.length || 0,
        url: result.assets[0].uri,
        localUri: result.assets[0].uri, // Store local URI
        mimeType: result.assets[0].mimeType || "image/jpeg",
        appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
        isUploaded: false, // Not uploaded yet
      };

      // Add to media for preview
      updateFormData("media", [...(formData.media || []), localAttachment]);
    }
  };
  const takePhotoWithCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Reduced for better performance
      base64: false, // Don't include base64 data
    });

    if (!result.canceled && result.assets) {
      // Store local file for preview - upload will happen on submission
      const localAttachment = {
        file_id: `local_${Date.now()}`,
        media_type: "photo" as const,
        file_name_original:
          result.assets[0].uri.split("/").pop() || "photo.jpg",
        display_order: formData.media?.length || 0,
        url: result.assets[0].uri,
        localUri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "image/jpeg",
        appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
        isUploaded: false,
      };

      updateFormData("media", [...(formData.media || []), localAttachment]);
    }
  };
  const pickVideoFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium, // Better for file size
      videoMaxDuration: 60, // Limit to 60 seconds
    });

    if (!result.canceled && result.assets) {
      // Store local file for preview - upload will happen on submission
      const localAttachment = {
        file_id: `local_${Date.now()}`,
        media_type: "video" as const,
        file_name_original:
          result.assets[0].uri.split("/").pop() || "video.mp4",
        display_order: formData.media?.length || 0,
        url: result.assets[0].uri,
        localUri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "video/mp4",
        appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
        isUploaded: false,
      };

      updateFormData("media", [...(formData.media || []), localAttachment]);
    }
  };
  const recordVideoWithCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium, // Better for file size
      videoMaxDuration: 60, // Limit to 60 seconds
    });

    if (!result.canceled && result.assets) {
      // Store local file for preview - upload will happen on submission
      const localAttachment = {
        file_id: `local_${Date.now()}`,
        media_type: "video" as const,
        file_name_original:
          result.assets[0].uri.split("/").pop() || "video.mp4",
        display_order: formData.media?.length || 0,
        url: result.assets[0].uri,
        localUri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "video/mp4",
        appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
        isUploaded: false,
      };
      updateFormData("media", [...(formData.media || []), localAttachment]);
    }
  };
  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        // Store local file for preview - upload will happen on submission
        const localAttachment = {
          file_id: `local_${Date.now()}`,
          media_type: "audio" as const,
          file_name_original: result.assets[0].name || "audio.mp3",
          display_order: formData.media?.length || 0,
          url: result.assets[0].uri,
          localUri: result.assets[0].uri,
          mimeType: result.assets[0].mimeType || "audio/mpeg",
          appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
          isUploaded: false,
        };

        updateFormData("media", [...(formData.media || []), localAttachment]);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        "Failed to pick audio: " + (err.message || "User cancelled"),
      );
    }
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync(); // Ensure permissions are still granted
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRecording);
    } catch (err: any) {
      Alert.alert(
        "Error",
        "Failed to start recording: " + (err.message || "Unknown error"),
      );
    }
  }

  async function stopRecording() {
    if (!recording) {
      return;
    }
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      if (uri) {
        // Store recorded audio for preview - upload will happen on submission
        const localAttachment = {
          file_id: `local_${Date.now()}`,
          media_type: "audio" as const,
          file_name_original: `recording_${Date.now()}.m4a`,
          display_order: formData.media?.length || 0,
          url: uri,
          localUri: uri,
          mimeType: "audio/m4a",
          appwrite_bucket_id: APPWRITE_CRIME_PATROL_BUCKET_ID,
          isUploaded: false,
        };

        updateFormData("media", [...(formData.media || []), localAttachment]);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        "Failed to stop recording: " + (err.message || "Unknown error"),
      );
    }
  }

  // async function loadAndPlaySound(uri: string) { // Commented out as not currently used
  //   if (sound) {
  //     await sound.unloadAsync();
  //     setSound(null);
  //   }
  //   try {
  //     const { sound: newSound } = await Audio.Sound.createAsync(
  //       { uri },
  //       { shouldPlay: true },
  //     );
  //     setSound(newSound);
  //   } catch (error: any) {
  //     Alert.alert(
  //       "Playback Error",
  //       "Could not play the audio file: " + (error.message || "Unknown error"),
  //     );
  //   }
  // }

  // useEffect(() => { // Commented out as sound state is not currently used  //   return sound
  //     ? () => {
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [sound]);
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
      ]).start(); // If this is the emergency section and incident is in progress
      if (currentSection === 0 && formData.is_in_progress) {
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

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };
  // Updated validation functions for new structure
  const validateIncidentSection = () => {
    if (!formData.incident_type) {
      Alert.alert("Missing Information", "Please select an incident type");
      return false;
    }
    if (!formData.description) {
      Alert.alert(
        "Missing Information",
        "Please provide a description of what happened",
      );
      return false;
    }
    return true;
  };

  const validateLocationSection = () => {
    if (!formData.location?.address) {
      Alert.alert("Missing Information", "Please enter a location");
      return false;
    }
    return true;
  };

  const validatePeopleSection = () => {
    if (!formData.reporter_info?.name) {
      Alert.alert("Missing Information", "Please enter your name");
      return false;
    }
    if (!formData.reporter_info?.phone) {
      Alert.alert(
        "Missing Information",
        "Please enter your phone number for follow-up",
      );
      return false;
    }
    return true;
  };

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

  // Function to handle media attachment based on type
  const handleAttachMedia = async (type: string) => {
    triggerHaptic();
    Animated.sequence([
      Animated.timing(mediaButtonsScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(mediaButtonsScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (type === "photo_gallery") {
      await pickImageFromGallery();
    } else if (type === "photo_camera") {
      await takePhotoWithCamera();
    } else if (type === "video_gallery") {
      await pickVideoFromGallery();
    } else if (type === "video_camera") {
      await recordVideoWithCamera();
    } else if (type === "audio_file") {
      await pickAudioFile();
    } else if (type === "audio_record") {
      if (recording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    }
  };

  // Batch upload all local media files before submission
  const uploadAllMedia = async () => {
    const localMediaItems =
      formData.media?.filter((item) => !item.isUploaded) || [];

    if (localMediaItems.length === 0) {
      return formData; // No media to upload
    }

    setIsUploading(true);
    let uploadedCount = 0;
    const updatedMedia = [...(formData.media || [])];

    try {
      for (const mediaItem of localMediaItems) {
        if (!mediaItem.localUri) {
          console.warn("Media item missing localUri, skipping:", mediaItem);
          continue;
        }

        setUploadProgress((uploadedCount / localMediaItems.length) * 100);

        // Upload to Cloudinary
        const uploadResponse = await uploadToCloudinary(
          mediaItem.localUri,
          mediaItem.file_name_original,
          mediaItem.media_type,
          (progress: number) => {
            const overallProgress =
              ((uploadedCount + progress / 100) / localMediaItems.length) * 100;
            setUploadProgress(overallProgress);
          },
        );

        // Update the media item with upload details
        const updatedMediaItem = {
          ...mediaItem,
          file_id: uploadResponse.public_id,
          secure_url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
          cloudinary_url: uploadResponse.url,
          format: uploadResponse.format,
          isUploaded: true,
        };

        // Replace the local item with uploaded item
        const itemIndex = updatedMedia.findIndex(
          (item) => item.file_id === mediaItem.file_id,
        );
        if (itemIndex !== -1) {
          updatedMedia[itemIndex] = updatedMediaItem;
        }

        uploadedCount++;
      }

      // Return updated form data with uploaded media
      return {
        ...formData,
        media: updatedMedia,
      };
    } catch (error: any) {
      console.error("Batch upload error:", error);

      let errorMessage = "Failed to upload media: ";
      if (error.message?.includes("Network")) {
        errorMessage +=
          "Network connection failed. Please check your internet connection.";
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }

      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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

    try {
      // First, upload all media files
      const updatedFormData = await uploadAllMedia();

      // Then submit the report with uploaded media URLs
      await submitNormalizedReport(updatedFormData);

      setIsSubmitting(false);
      Alert.alert(
        "Report Submitted",
        "Your crime report has been successfully submitted. A case number will be sent to your phone.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Error",
        `There was an error submitting your report: ${error.message || "Unknown error"}`,
      );
      setIsSubmitting(false);
    }
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
            onGetGPS={fetchAndSetCurrentLocation} // Passed prop
            isLoadingGPS={isLoadingGPS}
          />
        );
      case 2:
        return <PeopleSection {...commonProps} />;
      case 3:
        return (
          <MediaSection
            formData={formData}
            updateFormData={updateFormData}
            theme={theme}
            triggerHaptic={triggerHaptic}
            mediaButtonsScale={mediaButtonsScale}
            handleAttachMedia={handleAttachMedia}
            recording={!!recording} // Pass recording state (as boolean)
            isUploading={isUploading}
            uploadProgress={uploadProgress}
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
