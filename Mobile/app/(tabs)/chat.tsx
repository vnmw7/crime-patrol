import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  useColorScheme,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { launchImageLibrary } from "react-native-image-picker";
import * as FileSystem from "expo-file-system";
import { OpenAI } from "openai";
import Constants from "expo-constants";

// Get API key from environment variables or constants
const HUGGINGFACE_API_KEY =
  process.env.HUGGINGFACE_API_KEY ||
  Constants.expoConfig?.extra?.HUGGINGFACE_API_KEY ||
  "";

// App theme colors
const themeColors = {
  light: {
    primary: "#4A90E2",
    secondary: "#FF3B30",
    tertiary: "#007AFF",
    background: "#F8F8F8",
    card: "#FFFFFF",
    text: "#262626",
    textSecondary: "#8E8E8E",
    border: "#EEEEEE",
    inputBackground: "#F2F2F2",
    noticeBackground: "#FFECB3",
    noticeBorder: "#FFD180",
    noticeText: "#795548",
  },
  dark: {
    primary: "#4A90E2",
    secondary: "#FF453A",
    tertiary: "#0A84FF",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    border: "#2C2C2C",
    inputBackground: "#2C2C2C",
    noticeBackground: "#3E2723",
    noticeBorder: "#5D4037",
    noticeText: "#FFCC80",
  },
};

// Types for chat messages
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUri?: string;
  isLoading?: boolean;
  role?: "user" | "assistant" | "system";
}

// OpenAI configuration with better error handling and configuration
const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/nebius/v1",
  apiKey: HUGGINGFACE_API_KEY,
  timeout: 60000, // 60 second global timeout
  maxRetries: 3, // Enable built-in retries for transient errors
  defaultHeaders: {
    "User-Agent": "CrimePatrolApp/0.0.1",
  },
});

// Default system message for context with explicit role type
const SYSTEM_MESSAGE: { role: "system"; content: string } = {
  role: "system",
  content:
    "You are a helpful AI legal assistant for a crime reporting app. Provide clear, concise information about legal matters, crime reporting procedures, victim rights, and safety tips. Avoid giving specific legal advice.",
};

// Predefined topics for common queries
const PREDEFINED_TOPICS = [
  { id: "1", title: "How to report a crime", icon: "alert-circle-outline" },
  { id: "2", title: "What are my rights?", icon: "shield-outline" },
  { id: "3", title: "Safety tips", icon: "lock-closed-outline" },
  { id: "4", title: "Evidence collection", icon: "camera-outline" },
  { id: "5", title: "Emergency contacts", icon: "call-outline" },
];

// Initial greeting from the AI
const initialMessages: Message[] = [
  {
    id: "0",
    text: "Hello! I'm here to help with legal questions or crime reporting. What can I assist you with today?",
    isUser: false,
    timestamp: new Date(),
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (inputText.trim() === "" && !selectedImage) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      imageUri: selectedImage || undefined,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Add a placeholder for AI response that's loading
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      let response;

      // If there's an image, process it with OpenAI Vision API
      if (selectedImage) {
        response = await processImageWithOpenAI(
          selectedImage,
          inputText || "Describe this image in one sentence.",
        );
        setSelectedImage(null);
      } else {
        // Text-only response
        response = await generateAIResponse(inputText);
      }

      // Replace loading message with actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? { ...response, id: loadingMessageId }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error processing message:", error);

      // Replace loading message with error message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                text: "Sorry, there was an error processing your request. Please try again.",
                isUser: false,
                timestamp: new Date(),
              }
            : msg,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Retry function for API calls
  // Added trailing comma after <T> to disambiguate from JSX in .tsx file
  const retryApiCall = async <T,>(
    apiCallFn: () => Promise<T>,
    maxRetries: number,
    delay: number,
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCallFn();
      } catch (error: any) {
        lastError = error;

        // Only retry on 500 errors or network issues
        if (
          error.status === 500 ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.message?.includes("network")
        ) {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          // Increase delay for next retry attempt (exponential backoff)
          delay *= 1.5;
        } else {
          // Don't retry on other errors
          throw error;
        }
      }
    }

    // If we've exhausted all retries
    console.error(`Failed after ${maxRetries} retries`, lastError);
    throw lastError;
  };

  // Process images with OpenAI Vision API
  const processImageWithOpenAI = async (
    imageUri: string,
    prompt: string,
  ): Promise<Message> => {
    try {
      // Convert image to base64
      const base64Content = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      try {
        // Create request to OpenAI with retry mechanism
        const chatCompletion = await retryApiCall(
          () =>
            openai.chat.completions.create({
              model: "google/gemma-3-27b-it-fast", // Using the specified model
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: prompt,
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${base64Content}`,
                      },
                    },
                  ],
                },
              ],
              max_tokens: 500,
              stream: false, // Ensure non-streaming response type
            }),
          3,
          1000,
        ); // Explicitly pass maxRetries and delay

        return {
          id: Date.now().toString(),
          text:
            chatCompletion.choices[0].message.content || "No response from AI",
          isUser: false,
          timestamp: new Date(),
          role: "assistant",
        };
      } catch (apiError: any) {
        console.error("OpenAI API image processing error:", apiError);

        // Check for specific error types
        if (apiError.status === 500) {
          console.error(
            "Server error (500) from API provider during image processing",
          );
          return getFallbackResponse(
            "I'm having trouble processing this image due to a server error. Could you try with a different image or try again later?",
          );
        } else if (apiError.status === 429) {
          console.error("Rate limit exceeded (429) during image processing");
          return getFallbackResponse(
            "I've reached my image processing capacity. Please try again in a little while.",
          );
        } else if (
          apiError.status === 413 ||
          apiError.message?.includes("too large")
        ) {
          console.error("Image too large");
          return getFallbackResponse(
            "This image is too large for me to process. Could you try with a smaller image?",
          );
        } else if (
          apiError.status === 415 ||
          apiError.message?.includes("unsupported")
        ) {
          console.error("Unsupported media type");
          return getFallbackResponse(
            "I can't process this image format. Please try with a JPEG or PNG image.",
          );
        } else if (apiError.status === 401 || apiError.status === 403) {
          console.error("Authentication error:", apiError.status);
          return getFallbackResponse(
            "I'm having trouble accessing my image processing capabilities. This may be an API key issue.",
          );
        } else {
          throw apiError; // Re-throw for the outer catch
        }
      }
    } catch (error) {
      console.error("General error in image processing:", error);
      return getFallbackResponse(
        "I encountered an error while processing your image. Please try again or with a different image.",
      );
    }
  };

  // Handle image selection
  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    });

    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Handle selecting a predefined topic
  const handleTopicSelect = async (topic: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: topic,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsTyping(true);

    // Add a placeholder for AI response that's loading
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      // Get AI response for the topic with retry mechanism
      const response = await generateAIResponse(topic);

      // Replace loading message with actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? { ...response, id: loadingMessageId }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error processing topic:", error);

      // Replace loading message with error message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                text: "Sorry, there was an error processing your request. Please try again.",
                isUser: false,
                timestamp: new Date(),
              }
            : msg,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Process text messages with OpenAI
  const generateAIResponse = async (input: string): Promise<Message> => {
    try {
      // Convert previous messages to OpenAI format for context
      const messageHistory = messages.map((msg) => ({
        role: msg.isUser ? "user" : ("assistant" as const),
        content: msg.text,
      }));

      // Add system message at the beginning for context
      const apiMessages = [
        SYSTEM_MESSAGE,
        ...messageHistory.slice(-5), // Use last 5 messages for context
        { role: "user" as const, content: input },
      ];

      try {
        // Create request to OpenAI with timeout and retry logic
        const chatCompletion = await retryApiCall(
          () =>
            openai.chat.completions.create({
              model: "google/gemma-3-27b-it-fast", // Using the specified model
              // Explicitly cast messages array to the required type
              messages: apiMessages as OpenAI.Chat.ChatCompletionMessageParam[],
              max_tokens: 500,
              // Removed invalid timeout parameter; global timeout applies
              stream: false, // Ensure non-streaming response type
            }),
          3,
          1000,
        ); // Explicitly pass maxRetries and delay

        // Assert the type of chatCompletion to ensure .choices is accessible
        const completionResult = chatCompletion as OpenAI.Chat.ChatCompletion;

        return {
          id: Date.now().toString(),
          text:
            completionResult.choices[0].message.content || // Use asserted type
            "I'm sorry, I couldn't generate a response.",
          isUser: false,
          timestamp: new Date(),
          role: "assistant",
        };
      } catch (apiError: any) {
        console.error("OpenAI API specific error:", apiError);

        // Check for specific error types
        if (apiError.status === 500) {
          console.error("Server error (500) from API provider");
          return getFallbackResponse(
            "I'm experiencing technical difficulties with my server. Please try again in a moment.",
          );
        } else if (apiError.status === 429) {
          console.error("Rate limit exceeded (429)");
          return getFallbackResponse(
            "I've reached my capacity at the moment. Please try again in a little while.",
          );
        } else if (apiError.status === 401 || apiError.status === 403) {
          console.error("Authentication error:", apiError.status);
          return getFallbackResponse(
            "I'm having trouble accessing my knowledge. This may be an API key issue.",
          );
        } else if (apiError.status >= 400 && apiError.status < 500) {
          console.error("Client error:", apiError.status);
          return getFallbackResponse(
            "There was a problem with my request. Please try again with a different question.",
          );
        } else if (
          apiError.code === "ECONNABORTED" ||
          apiError.message?.includes("timeout")
        ) {
          console.error("Request timeout");
          return getFallbackResponse(
            "The request took too long to complete. Please try again or simplify your question.",
          );
        } else {
          throw apiError; // Re-throw for the outer catch
        }
      }
    } catch (error) {
      console.error("General error in AI response generation:", error);
      return getFallbackResponse(
        "I'm having trouble connecting to my knowledge base right now. Please try again later.",
      );
    }
  };

  // Helper function for fallback responses
  const getFallbackResponse = (message: string): Message => ({
    id: Date.now().toString(),
    text: message,
    isUser: false,
    timestamp: new Date(),
    role: "assistant",
  });

  // Render individual message bubbles
  const renderMessage = (message: Message) => {
    const isUserMessage = message.isUser;
    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.aiBubble, { backgroundColor: theme.card }],
        ]}
      >
        {message.isLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <>
            {message.imageUri && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: message.imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                { color: isUserMessage ? "#FFFFFF" : theme.text },
              ]}
            >
              {message.text}
            </Text>
            <Text
              style={[
                styles.timestampText,
                {
                  color: isUserMessage
                    ? "rgba(255,255,255,0.7)"
                    : theme.textSecondary,
                },
              ]}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </>
        )}
      </View>
    );
  };

  // Render predefined topic buttons
  const renderTopicItem = ({
    item,
  }: {
    item: { id: string; title: string; icon: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.topicButton,
        {
          backgroundColor:
            colorScheme === "dark" ? "rgba(74, 144, 226, 0.2)" : "#F0F7FF",
          borderColor:
            colorScheme === "dark" ? "rgba(74, 144, 226, 0.4)" : "#E0E9F7",
        },
      ]}
      onPress={() => handleTopicSelect(item.title)}
    >
      <Ionicons name={item.icon as any} size={18} color={theme.primary} />
      <Text style={[styles.topicText, { color: theme.primary }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>
          AI Legal Assistant
        </Text>
      </View>

      {/* Predefined Topics */}
      <View
        style={[
          styles.topicsContainer,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[styles.topicsTitle, { color: theme.textSecondary }]}>
          Common Topics
        </Text>
        <FlatList
          data={PREDEFINED_TOPICS}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsList}
        />
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageRow}>
            {renderMessage(message)}
          </View>
        ))}

        {isTyping && (
          <View
            style={[
              styles.messageBubble,
              styles.aiBubble,
              { backgroundColor: theme.card },
            ]}
          >
            <Text
              style={[styles.typingIndicator, { color: theme.textSecondary }]}
            >
              AI is typing...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Legal Notice */}
      <View
        style={[
          styles.noticeContainer,
          {
            backgroundColor: theme.noticeBackground,
            borderTopColor: theme.noticeBorder,
          },
        ]}
      >
        <Text style={[styles.noticeText, { color: theme.noticeText }]}>
          This AI assistant is not a substitute for professional legal advice.
        </Text>
      </View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={[
          styles.inputContainer,
          { backgroundColor: theme.card, borderTopColor: theme.border },
        ]}
      >
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleSelectImage}
        >
          <Ionicons name="image-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question here..."
          placeholderTextColor={theme.textSecondary}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim() || selectedImage
                  ? theme.primary
                  : theme.border,
            },
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() && !selectedImage}
        >
          <Ionicons
            name="send"
            size={24}
            color={
              !inputText.trim() && !selectedImage
                ? theme.textSecondary
                : "white"
            }
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  topicsContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  topicsList: {
    paddingRight: 15,
  },
  topicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E9F7",
  },
  topicText: {
    fontSize: 13,
    color: "#4A90E2",
    marginLeft: 6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    width: "100%",
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: "#4A90E2",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
  },
  timestampText: {
    fontSize: 10,
    color: "#888888",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  typingIndicator: {
    fontSize: 14,
    color: "#888888",
    fontStyle: "italic",
  },
  noticeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFECB3",
    borderTopWidth: 1,
    borderTopColor: "#FFD180",
  },
  noticeText: {
    fontSize: 12,
    color: "#795548",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: "#333333",
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  imageContainer: {
    marginBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 8,
    marginRight: 10,
  },
  selectedImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 11,
  },
  attachButton: {
    marginRight: 10,
    padding: 5,
  },
});
