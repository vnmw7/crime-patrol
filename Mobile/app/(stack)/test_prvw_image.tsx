import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Video,
  ResizeMode,
  AVPlaybackStatus,
  VideoFullscreenUpdate,
} from "expo-av";

const { width, height } = Dimensions.get("window");

// Video URL from Cloudinary - assuming similar base path for videos
const VIDEO_URL =
  "https://res.cloudinary.com/dggmqy8tk/video/upload/v1749636722/c8ae1447-32c9-45aa-80e3-08716b6a5a5b_zdxroo.mp4";

const themeColors = {
  light: {
    primary: "#0095F6",
    secondary: "#FF3B30",
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#262626",
    textSecondary: "#8E8E8E",
    border: "#DBDBDB",
  },
  dark: {
    primary: "#0095F6",
    secondary: "#FF453A",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    border: "#2C2C2C",
  },
};

const TestVideoPreviewScreen = () => {
  // Renamed component for clarity
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme ?? "light"];
  const videoPreviewRef = useRef<Video>(null);
  const videoModalRef = useRef<Video>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openVideoModal = () => {
    triggerHaptic();
    setModalVisible(true);
  };

  const closeVideoModal = () => {
    triggerHaptic();
    setModalVisible(false);
    videoModalRef.current?.setStatusAsync({ shouldPlay: false }); // Stop video on close
  };

  const handleVideoLoadStart = () => {
    setVideoLoading(true);
    setVideoError(false);
  };

  const handleVideoStatusUpdate = (
    status: AVPlaybackStatus,
    type: "preview" | "modal",
  ) => {
    if (!status.isLoaded) {
      if (status.error) {
        setVideoLoading(false);
        setVideoError(true);
        console.error(`Video Error (${type}):`, status.error);
        Alert.alert(
          "Error",
          "Failed to load video. Please check the URL or your connection.",
        );
      }
    } else {
      setVideoLoading(false);
      setVideoError(false);
      // if (type === 'preview' && status.didJustFinish) {
      //   videoPreviewRef.current?.replayAsync(); // Optional: replay preview when finished
      // }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Preview Card */}
        <View
          style={[
            styles.mediaCard, // Renamed style for generality
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="videocam" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Cloudinary Video
            </Text>
          </View>

          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Tap the video to view in full screen
          </Text>

          <TouchableOpacity
            style={styles.mediaContainer} // Renamed style
            onPress={openVideoModal}
            activeOpacity={0.9}
          >
            {videoLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text
                  style={[styles.loadingText, { color: theme.textSecondary }]}
                >
                  Loading video...
                </Text>
              </View>
            )}

            {videoError && !videoLoading && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="videocam-outline"
                  size={60}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.errorText, { color: theme.textSecondary }]}
                >
                  Failed to load video
                </Text>
              </View>
            )}

            <Video
              ref={videoPreviewRef}
              style={[
                styles.previewMedia, // Renamed style
                { opacity: videoLoading || videoError ? 0 : 1 },
              ]}
              source={{ uri: VIDEO_URL }}
              resizeMode={ResizeMode.COVER}
              isMuted
              shouldPlay={false} // No autoplay for preview
              onLoadStart={handleVideoLoadStart}
              onPlaybackStatusUpdate={(status) =>
                handleVideoStatusUpdate(status as AVPlaybackStatus, "preview")
              }
            />

            {!videoLoading && !videoError && (
              <View style={styles.mediaOverlay}>
                <Ionicons name="play-circle-outline" size={40} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.mediaInfo}>
            <Text
              style={[styles.mediaInfoText, { color: theme.textSecondary }]}
            >
              Source: Cloudinary CDN
            </Text>
            <Text
              style={[styles.mediaInfoText, { color: theme.textSecondary }]}
            >
              Format: MP4
            </Text>
          </View>
        </View>

        {/* Instructions Card (content might need updating for video) */}
        <View
          style={[
            styles.instructionsCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              How to Use
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="finger-print" size={16} color={theme.primary} />
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Tap the video to open in full-screen mode
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="play-circle" size={16} color={theme.primary} />
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Use controls to play, pause, and seek video
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="close" size={16} color={theme.primary} />
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Tap the X button or outside to close
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Full-Screen Video Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill} // Click outside to close
            onPress={closeVideoModal}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <Video
              ref={videoModalRef}
              style={styles.fullScreenMedia} // Renamed style
              source={{ uri: VIDEO_URL }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay={modalVisible} // Autoplay when modal becomes visible
              onPlaybackStatusUpdate={(status) =>
                handleVideoStatusUpdate(status as AVPlaybackStatus, "modal")
              }
              onFullscreenUpdate={(event) => {
                if (
                  event.fullscreenUpdate ===
                  VideoFullscreenUpdate.PLAYER_WILL_DISMISS
                ) {
                  closeVideoModal();
                }
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeVideoModal}
              accessibilityLabel="Close video"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mediaCard: {
    // Renamed from imageCard
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  mediaContainer: {
    // Renamed from imageContainer
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#e0e0e0", // Darker placeholder for video
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    padding: 10,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  previewMedia: {
    // Renamed from previewImage
    width: "100%",
    height: "100%",
  },
  mediaOverlay: {
    // Renamed from imageOverlay
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  mediaInfo: {
    // Renamed from imageInfo
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaInfoText: {
    // Renamed from imageInfoText
    fontSize: 12,
  },
  instructionsCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16, // Added margin if it's the second card
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%", // Video will be contained within this
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 50, // Consider using insets.top + 10 for better positioning
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  fullScreenMedia: {
    // Renamed from fullScreenImage
    width: "100%",
    height: "100%",
    backgroundColor: "black", // Important for letterboxing with ResizeMode.CONTAIN
  },
});

export default TestVideoPreviewScreen; // Renamed export
