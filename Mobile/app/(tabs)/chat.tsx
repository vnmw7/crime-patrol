import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

// Create OpenAI client with OpenRouter base URL
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  Constants.expoConfig?.extra?.OPENROUTER_API_KEY ||
  "";

const AIML_API_KEY =
  process.env.AIML_API_KEY || Constants.expoConfig?.extra?.AIML_API_KEY || "";

// Define message type
interface Message {
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "You are a helpful assistant for the Crime Patrol app. Your primary role is to act as a legal advisor for common issues in the Philippines, providing general information and guidance. You also help users with crime reporting information and safety advice. Always remind users that you are an AI assistant and your advice is not a substitute for consultation with a qualified legal professional. Do not provide specific legal advice for individual cases, but rather general information on laws, procedures, and rights in the Philippines.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const navigateToMenu = () => {
    triggerHaptic();
    router.push("/menu" as any);
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      content: inputText.trim(),
    };

    // Use a temporary messages array for API calls to include the latest user message immediately
    const currentMessagesWithUser = [...messages, userMessage];
    setMessages(currentMessagesWithUser); // Update UI
    setInputText("");
    setIsLoading(true);

    let apiResponse = null;

    // Attempt 1: Primary LLM (OpenRouter)
    try {
      if (!OPENROUTER_API_KEY) {
        console.warn("OpenRouter API Key is missing. Skipping primary LLM.");
        throw new Error("OpenRouter API Key missing"); // Force fallback
      }
      console.log("Attempting Primary LLM (OpenRouter)...");
      apiResponse = await callOpenRouter(currentMessagesWithUser);
      if (!apiResponse?.choices?.[0]?.message?.content) {
        console.warn(
          "Primary LLM (OpenRouter) returned invalid or empty response.",
        );
        apiResponse = null; // Ensure fallback is tried
      }
    } catch (primaryError) {
      console.error("Error calling OpenRouter (Primary LLM):", primaryError);
      apiResponse = null; // Ensure fallback is tried
    }

    // Attempt 2: Backup LLM (AIMLAPI) if primary failed or returned invalid content
    if (!apiResponse?.choices?.[0]?.message?.content) {
      console.log(
        "Primary LLM failed or no content. Attempting Backup LLM (AIMLAPI)...",
      );
      try {
        if (!AIML_API_KEY) {
          console.warn("AIML API Key is missing. Skipping backup LLM.");
          throw new Error("AIML API Key missing");
        }
        apiResponse = await callAIMLAPI(currentMessagesWithUser);
        if (!apiResponse?.choices?.[0]?.message?.content) {
          console.warn(
            "Backup LLM (AIMLAPI) also returned invalid or empty response.",
          );
          apiResponse = null;
        }
      } catch (backupError) {
        console.error("Error calling AIMLAPI (Backup LLM):", backupError);
        apiResponse = null;
      }
    }

    // Process the response or error
    if (apiResponse?.choices?.[0]?.message?.content) {
      const assistantMessage: Message = {
        content: apiResponse.choices[0].message.content,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } else {
      const errorMessage: Message = {
        content:
          "Sorry, I encountered an error connecting to the assistant services. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setIsLoading(false);
  };
  // Helper function to format messages for API calls
  const formatMessagesForApi = (messageHistory: Message[]) => {
    return messageHistory.map((msg, index) => ({
      role: index === 0 ? "system" : index % 2 !== 0 ? "user" : "assistant",
      content: msg.content,
    }));
  };

  async function callOpenRouter(messageHistory: Message[]) {
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API Key is missing.");
      throw new Error("OpenRouter API Key is missing.");
    }
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const formattedMessages = formatMessagesForApi(messageHistory);

    const payload = {
      model: "meta-llama/llama-3.3-8b-instruct:free",
      messages: formattedMessages,
    };

    console.log(
      "Calling OpenRouter with payload:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", response.status, errorBody);
      throw new Error(
        `OpenRouter API request failed with status ${response.status}: ${errorBody}`,
      );
    }
    return await response.json();
  }

  async function callAIMLAPI(messageHistory: Message[]) {
    if (!AIML_API_KEY) {
      console.error("AIMLAPI Key is missing.");
      throw new Error("AIMLAPI Key is missing.");
    }
    const aimlApiUrl = "https://api.aimlapi.com/v1/chat/completions";
    const formattedMessages = formatMessagesForApi(messageHistory);

    const payload = {
      model: "gpt-4o", // Backup model
      messages: formattedMessages,
    };

    console.log(
      "Calling AIMLAPI with payload:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(aimlApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AIML_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("AIMLAPI API Error:", response.status, errorBody);
      throw new Error(
        `AIMLAPI request failed with status ${response.status}: ${errorBody}`,
      );
    }
    const jsonData = await response.json();
    console.log("AIMLAPI Response object:", jsonData);
    return jsonData;
  }
  const renderMessageItem = ({
    item,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    // Do not render the system prompt (index 0)
    if (index === 0) return null;

    // Determine if the message is from the user or assistant
    // After the system prompt (index 0):
    // User messages are at odd indices (1, 3, 5, ...)
    // Assistant messages are at even indices (2, 4, 6, ...)
    const isUser = index % 2 !== 0;

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[styles.messageText, !isUser && styles.assistantMessageText]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crime Patrol Assistant</Text>
        <TouchableOpacity style={styles.menuButton} onPress={navigateToMenu}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(_, index) => index.toString()}
        style={styles.chatList}
        contentContainerStyle={styles.chatContent}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0084ff" />
          <Text style={styles.loadingText}>Assistant is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />{" "}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: Constants.statusBarHeight + 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 34,
    flex: 1,
  },
  menuButton: {
    padding: 10,
  },
  chatList: {
    flex: 1,
  },
  chatContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#0084ff",
    alignSelf: "flex-end",
    marginLeft: 50,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
    marginRight: 50,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "white", // Default for user messages
  },
  assistantMessageText: {
    color: "#333", // Assistant text color
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    paddingHorizontal: 15,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
