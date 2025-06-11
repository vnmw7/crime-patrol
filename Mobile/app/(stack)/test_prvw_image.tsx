import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Image,
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

const { width, height } = Dimensions.get("window");

// Image URL from Cloudinary
const IMAGE_URL =
  "https://res.cloudinary.com/dggmqy8tk/image/upload/v1749631847/a71b99c1-6b73-4dc9-aeba-ec62ca475d22_r46jco.jpg";

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

const TestImagePreviewScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme ?? "light"];

  const [modalVisible, setModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openImageModal = () => {
    triggerHaptic();
    setModalVisible(true);
  };

  const closeImageModal = () => {
    triggerHaptic();
    setModalVisible(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    Alert.alert(
      "Error",
      "Failed to load image. Please check your internet connection.",
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview Card */}
        <View
          style={[
            styles.imageCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="image" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Cloudinary Image
            </Text>
          </View>

          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Tap the image to view in full screen
          </Text>

          <TouchableOpacity
            style={styles.imageContainer}
            onPress={openImageModal}
            activeOpacity={0.9}
          >
            {imageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text
                  style={[styles.loadingText, { color: theme.textSecondary }]}
                >
                  Loading image...
                </Text>
              </View>
            )}

            {imageError && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="image-outline"
                  size={60}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.errorText, { color: theme.textSecondary }]}
                >
                  Failed to load image
                </Text>
              </View>
            )}

            <Image
              source={{ uri: IMAGE_URL }}
              style={[
                styles.previewImage,
                { opacity: imageLoading || imageError ? 0 : 1 },
              ]}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {!imageLoading && !imageError && (
              <View style={styles.imageOverlay}>
                <Ionicons name="expand" size={30} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.imageInfo}>
            <Text
              style={[styles.imageInfoText, { color: theme.textSecondary }]}
            >
              Source: Cloudinary CDN
            </Text>
            <Text
              style={[styles.imageInfoText, { color: theme.textSecondary }]}
            >
              Format: JPEG
            </Text>
          </View>
        </View>

        {/* Instructions Card */}
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
              Tap the image to open in full-screen mode
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Ionicons name="expand" size={16} color={theme.primary} />
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Pinch to zoom and pan around the image
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

      {/* Full-Screen Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeImageModal}
            activeOpacity={1}
          />

          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageModal}
              accessibilityLabel="Close image"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              maximumZoomScale={3}
              minimumZoomScale={1}
              bouncesZoom={true}
            >
              <Image
                source={{ uri: IMAGE_URL }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageCard: {
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
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  imageInfo: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageInfoText: {
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
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
});

export default TestImagePreviewScreen;
