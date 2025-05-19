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

// Create OpenAI client with OpenRouter base URL
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  Constants.expoConfig?.extra?.OPENROUTER_API_KEY ||
  "";

// Define message type
interface Message {
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "You are a helpful assistant for the Crime Patrol app. Help users with crime reporting information and safety advice.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    // Add user message to chat
    const userMessage: Message = {
      content: inputText.trim(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await callOpenRouter([...messages, userMessage]);

      // Add assistant response to chat
      if (response.choices && response.choices[0]?.message) {
        const assistantMessage: Message = {
          content:
            response.choices[0].message.content ||
            "Sorry, I couldn't generate a response.",
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Error calling OpenRouter:", error);
      // Add error message
      const errorMessage: Message = {
        content: "Sorry, I encountered an error. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  async function callOpenRouter(messageHistory: Message[]) {
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Format messages for the API - Adding roles for API requirement
    const formattedMessages = messageHistory.map((msg, index) => ({
      role: index === 0 ? "system" : index % 2 === 0 ? "assistant" : "user",
      content: msg.content,
    }));

    const payload = {
      model: "google/gemma-3-1b-it:free", // Using the model you specified
      messages: formattedMessages,
    };

    try {
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
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Network or other error calling OpenRouter:", error);
      throw error;
    }
  }

  const renderMessageItem = ({
    item,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    // Skip the first message (system message)
    if (index === 0) return null;

    // Determine if it's a user message based on position in array
    const isUser = index % 2 !== 0;

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crime Patrol Assistant</Text>
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
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
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
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
    color: "#333",
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
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#0084ff",
    width: 60,
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
  },
});
