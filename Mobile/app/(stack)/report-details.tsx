import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
} from "react-native";
import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { Audio, Video, ResizeMode, VideoFullscreenUpdate } from "expo-av"; // Added Video, ResizeMode, VideoFullscreenUpdate
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
  reportService,
  CompleteReport,
  MediaItem,
} from "../../lib/reportService"; // Changed to relative path and added CompleteReport, MediaItem
// import { WebView } from "react-native-webview"; // Removed WebView import

const ReportDetailsScreen = () => {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [report, setReport] = useState<CompleteReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [audioStatus, setAudioStatus] = useState<any>(null);
  const videoModalRef = useRef<Video>(null); // Added videoModalRef

  // This is for showing dynamic content in the modal
  const [urlSelectedMedia, setUrlSelectedMedia] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  useEffect(() => {
    if (!reportId) {
      setError("No report ID provided");
      setLoading(false);
      return;
    }

    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedReport =
          await reportService.fetchCompleteReportDetails(reportId);
        setReport(fetchedReport);
      } catch (e: any) {
        console.error("Failed to fetch report details:", e);
        setError(
          e.message || "Failed to fetch report details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const openMediaModal = (media: MediaItem, url: string, type: string) => {
    console.log("[report-details.tsx] Opening media modal for:", media);
    console.log("[report-details.tsx] url:", url);
    console.log("[report-details.tsx] type:", type);

    setSelectedMedia(media);
    setUrlSelectedMedia(url);
    setModalVisible(true);

    switch (type) {
      case "photo":
        setIsImageModalOpen(true);
        setIsVideoModalOpen(false);
        setIsAudioModalOpen(false);
        break;
      case "video":
        setIsImageModalOpen(false);
        setIsVideoModalOpen(true);
        setIsAudioModalOpen(false);
        break;
      case "audio":
        setIsImageModalOpen(false);
        setIsVideoModalOpen(false);
        setIsAudioModalOpen(true);
        break;
      default:
        Alert.alert(
          "Unsupported media type",
          "This media type is not supported.",
        );
        setModalVisible(false); // Close modal if type is unsupported
    }
  };

  const closeMediaModal = async () => {
    // Stop audio if playing
    if (audioSound) {
      await audioSound.stopAsync();
      await audioSound.unloadAsync();
      setAudioSound(null);
    }
    setIsPlaying(false);
    setModalVisible(false);
    setSelectedMedia(null);
    setIsImageModalOpen(false);
    setIsVideoModalOpen(false);
    setIsAudioModalOpen(false);
    setUrlSelectedMedia(""); // Reset the URL
  };

  // Handle audio playback
  const toggleAudioPlayback = async () => {
    try {
      if (
        !selectedMedia?.cloudinary_url &&
        !selectedMedia?.secure_url &&
        !selectedMedia?.file_url
      ) {
        Alert.alert("Error", "No audio URL available");
        return;
      }

      const audioUri =
        selectedMedia.cloudinary_url ||
        selectedMedia.secure_url ||
        selectedMedia.file_url ||
        "";

      if (audioSound) {
        if (isPlaying) {
          await audioSound.pauseAsync();
          setIsPlaying(false);
        } else {
          await audioSound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
        );
        setAudioSound(sound);
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          setAudioStatus(status);
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      Alert.alert("Error", "Failed to play audio");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "in_progress":
        return "#007AFF";
      case "resolved":
        return "#28A745";
      case "closed":
        return "#6C757D";
      default:
        return colors.text;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#DC3545";
      case "medium":
        return "#FFC107";
      case "low":
        return "#28A745";
      default:
        return colors.text;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };
  const generateThumbnailUrl = (
    originalUrl: string,
    mediaType: string = "photo",
  ) => {
    if (!originalUrl) return originalUrl;

    if (originalUrl.includes("cloudinary.com")) {
      // For Cloudinary URLs, generate optimized thumbnails
      if (mediaType === "video") {
        // Generate video thumbnail from first frame
        return originalUrl
          .replace(
            "/upload/",
            "/upload/w_200,h_200,c_fill,q_auto,f_auto,so_1.0/",
          )
          .replace(/\.[^.]+$/, ".jpg");
      } else {
        // Generate image thumbnail
        return originalUrl.replace(
          "/upload/",
          "/upload/w_200,h_200,c_fill,q_auto,f_auto/",
        );
      }
    }

    // For other URLs, return as-is
    return originalUrl;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading report details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="alert-circle" size={64} color="#DC3545" />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Report not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Incident Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>
              Type:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {report.incident_type}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>
              Date:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatDate(report.incident_date)}
            </Text>
          </View>

          {report.metadata?.incident_time && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Time:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {report.metadata.incident_time}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>
              Status:
            </Text>
            <Text
              style={[
                styles.infoValue,
                { color: getStatusColor(report.status) },
              ]}
            >
              {report.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>

          {report.metadata?.priority_level && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Priority:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: getPriorityColor(report.metadata.priority_level) },
                ]}
              >
                {report.metadata.priority_level.toUpperCase()}
              </Text>
            </View>
          )}

          {report.metadata?.is_in_progress !== undefined && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                In Progress:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {report.metadata.is_in_progress ? "Yes" : "No"}
              </Text>
            </View>
          )}
        </View>
        {/* Description */}
        {report.metadata?.description && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {report.metadata.description}
            </Text>
          </View>
        )}
        {/* Location Information */}
        {report.location && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Location
            </Text>

            {report.location.location_address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Address:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.location.location_address}
                </Text>
              </View>
            )}

            {report.location.location_type && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Type:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.location.location_type}
                </Text>
              </View>
            )}

            {report.location.location_details && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Details:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.location.location_details}
                </Text>
              </View>
            )}

            {report.location.latitude && report.location.longitude && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Coordinates:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.location.latitude.toFixed(6)},{" "}
                  {report.location.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
        )}
        {/* Reporter Information */}
        {report.reporter_info && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reporter Information
            </Text>

            {report.reporter_info.reporter_name && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Name:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.reporter_info.reporter_name}
                </Text>
              </View>
            )}

            {report.reporter_info.reporter_phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Phone:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.reporter_info.reporter_phone}
                </Text>
              </View>
            )}

            {report.reporter_info.reporter_email && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Email:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.reporter_info.reporter_email}
                </Text>
              </View>
            )}

            {report.metadata?.is_victim_reporter !== undefined && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Is Victim:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {report.metadata.is_victim_reporter ? "Yes" : "No"}
                </Text>
              </View>
            )}
          </View>
        )}
        {/* Victims */}
        {report.victims && report.victims.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Victims ({report.victims.length})
            </Text>
            {report.victims.map((victim: any, index: any) => (
              <View key={index} style={styles.listItem}>
                {victim.victim_name && (
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    <Text style={styles.listItemLabel}>Name:</Text>{" "}
                    {victim.victim_name}
                  </Text>
                )}
                {victim.victim_contact && (
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    <Text style={styles.listItemLabel}>Contact:</Text>{" "}
                    {victim.victim_contact}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        {/* Suspects */}
        {report.suspects && report.suspects.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suspects ({report.suspects.length})
            </Text>
            {report.suspects.map((suspect: any, index: any) => (
              <View key={index} style={styles.listItem}>
                {suspect.suspect_description && (
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    <Text style={styles.listItemLabel}>Description:</Text>{" "}
                    {suspect.suspect_description}
                  </Text>
                )}
                {suspect.suspect_vehicle && (
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    <Text style={styles.listItemLabel}>Vehicle:</Text>{" "}
                    {suspect.suspect_vehicle}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        {/* Witnesses */}
        {report.witnesses && report.witnesses.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Witnesses ({report.witnesses.length})
            </Text>
            {report.witnesses.map((witness: any, index: any) => (
              <View key={index} style={styles.listItem}>
                {witness.witness_info && (
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    {witness.witness_info}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}{" "}
        {/* Media */}
        {report.media && report.media.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="images"
                size={20}
                color={colors.primary || "#0095F6"}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Media ({report.media.length})
              </Text>
            </View>{" "}
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>
              Tap any media item to view in full screen
            </Text>
            <View style={styles.mediaGrid}>
              {report.media.map((media: any, index: any) => {
                const mediaUri =
                  media.cloudinary_url || media.secure_url || media.file_url;

                return (
                  <View
                    key={index}
                    style={[
                      styles.mediaCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.mediaContainer}>
                      {media.media_type === "photo" && mediaUri && (
                        <TouchableOpacity
                          style={styles.mediaPreviewContainer}
                          onPress={() =>
                            openMediaModal(media, mediaUri, "photo")
                          }
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{
                              uri: generateThumbnailUrl(mediaUri, "photo"),
                            }}
                            style={styles.previewMedia}
                            resizeMode="cover"
                          />
                          <View style={styles.mediaOverlay}>
                            <Ionicons name="expand" size={20} color="white" />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* Video Thumbnail */}
                      {media.media_type === "video" && mediaUri && (
                        <TouchableOpacity
                          style={styles.mediaPreviewContainer}
                          onPress={() =>
                            openMediaModal(media, mediaUri, "video")
                          }
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{
                              uri: generateThumbnailUrl(mediaUri, "video"),
                            }}
                            style={styles.previewMedia}
                            resizeMode="cover"
                            onError={() => {
                              console.log(
                                "Video thumbnail failed to load for URI:",
                                mediaUri,
                              );
                            }}
                          />
                          <View style={styles.mediaOverlay}>
                            <Ionicons
                              name="play-circle"
                              size={24}
                              color="white"
                            />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* Audio Thumbnail */}
                      {media.media_type === "audio" && (
                        <TouchableOpacity
                          style={styles.mediaPreviewContainer}
                          onPress={() =>
                            openMediaModal(media, mediaUri || "", "audio")
                          }
                          activeOpacity={0.9}
                        >
                          <View
                            style={[styles.previewMedia, styles.audioPreview]}
                          >
                            <Ionicons
                              name="musical-notes"
                              size={32}
                              color="white"
                            />
                          </View>
                          <View style={styles.mediaOverlay}>
                            <Ionicons name="play" size={20} color="white" />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                    {/* Media Info */}
                    <View style={styles.mediaInfo}>
                      <Text
                        style={[
                          styles.mediaInfoType,
                          { color: colors.primary || "#0095F6" },
                        ]}
                      >
                        {media.media_type.toUpperCase()}
                      </Text>
                      <Text
                        style={[styles.mediaInfoText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {media.file_name_original ||
                          `${media.media_type}_${index + 1}`}
                      </Text>
                    </View>{" "}
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {/* Timestamps */}
        {(report.metadata?.created_at || report.metadata?.updated_at) && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Timestamps
            </Text>

            {report.metadata.created_at && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Created:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(report.metadata.created_at)}
                </Text>
              </View>
            )}

            {report.metadata.updated_at && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Updated:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(report.metadata.updated_at)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Media Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeMediaModal}
            activeOpacity={1}
          />

          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeMediaModal}
              accessibilityLabel="Close media"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            {isImageModalOpen && selectedMedia && urlSelectedMedia && (
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
                  source={{ uri: urlSelectedMedia }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </ScrollView>
            )}

            {isVideoModalOpen && selectedMedia && urlSelectedMedia && (
              <View style={styles.fullVideoContainer}>
                <Video
                  ref={videoModalRef}
                  style={styles.fullScreenImage} // Using fullScreenImage style for consistency
                  source={{ uri: urlSelectedMedia }}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay={isVideoModalOpen}
                  onFullscreenUpdate={(event) => {
                    if (
                      event.fullscreenUpdate ===
                      VideoFullscreenUpdate.PLAYER_WILL_DISMISS
                    ) {
                      closeMediaModal();
                    }
                  }}
                />
              </View>
            )}

            {isAudioModalOpen && selectedMedia && urlSelectedMedia && (
              <View style={styles.fullAudioContainer}>
                <View style={styles.audioPlayerContainer}>
                  <Ionicons name="musical-notes" size={60} color="white" />
                  <Text style={styles.audioFileName} numberOfLines={2}>
                    {selectedMedia.file_name_original || "Audio Track"}
                  </Text>
                  <View style={styles.audioControls}>
                    <TouchableOpacity
                      style={styles.audioButton}
                      onPress={toggleAudioPlayback}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={30}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                  {audioStatus && audioStatus.isLoaded && (
                    <View style={styles.audioProgress}>
                      <Text style={styles.audioTime}>
                        {new Date(audioStatus.positionMillis || 0)
                          .toISOString()
                          .substr(14, 5)}{" "}
                        /{" "}
                        {new Date(audioStatus.durationMillis || 0)
                          .toISOString()
                          .substr(14, 5)}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                ((audioStatus.positionMillis || 0) /
                                  (audioStatus.durationMillis || 1)) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    width: 100,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  listItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  listItemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  listItemLabel: {
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  mediaGrid: {
    marginTop: 8,
  },
  mediaCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  mediaContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    backgroundColor: "#e0e0e0",
  },
  mediaPreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },
  audioPreview: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#666",
  },
  mediaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  mediaInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  mediaInfoType: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  mediaInfoText: {
    fontSize: 10,
    textAlign: "center",
    opacity: 0.8,
  },
  mediaItemContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  mediaThumbnail: {
    marginRight: 12,
    alignItems: "center",
    width: 90,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  videoThumbnailContainer: {
    position: "relative",
  },
  videoThumbnail: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
  },
  audioThumbnail: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#666",
  },
  mediaType: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  mediaFileName: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
    width: 80,
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullImage: {
    // This style might be deprecated if fullScreenImage is used
    width: "100%",
    height: "100%",
  },
  fullScreenImage: {
    // Ensure this style is defined for the image modal
    width: "100%",
    height: "100%",
  },
  modalScrollView: {
    // Added for image scroll
    width: "100%",
    height: "100%",
  },
  modalScrollContent: {
    // Added for image scroll content
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullWebView: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  fullVideoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullVideo: {
    width: "100%",
    height: "100%",
  },
  fullAudioContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  audioPlayerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 30,
    minWidth: 250,
  },
  audioFileName: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 15,
    marginHorizontal: 10,
  },
  audioProgress: {
    alignItems: "center",
    width: "100%",
  },
  audioTime: {
    color: "white",
    fontSize: 12,
    marginBottom: 10,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
});

export default ReportDetailsScreen;
