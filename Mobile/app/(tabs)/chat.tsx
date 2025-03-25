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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

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
}

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
  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle selecting a predefined topic
  const handleTopicSelect = (topic: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: topic,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsTyping(true);

    // Simulate AI response for the selected topic
    setTimeout(() => {
      const aiResponse = generateAIResponse(topic);
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Mock function to generate AI responses based on user input
  const generateAIResponse = (input: string): Message => {
    let response = "";
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("report") || lowerInput.includes("how to report")) {
      response =
        "To report a crime, you should provide detailed information including location, time, and description of the incident. Would you like me to guide you through the reporting process?";
    } else if (lowerInput.includes("rights")) {
      response =
        "You have the right to report crimes without fear of retaliation. If you're a victim, you have rights to information, protection, and compensation. Would you like me to explain any specific right in more detail?";
    } else if (lowerInput.includes("safety") || lowerInput.includes("tips")) {
      response =
        "Some safety tips include staying aware of your surroundings, keeping your devices secure, and having emergency contacts readily available. What specific safety concerns do you have?";
    } else if (lowerInput.includes("evidence")) {
      response =
        "When collecting evidence, document everything without tampering with the scene. Take photos, note times and dates, and preserve any digital evidence like messages. How can I help you with evidence collection?";
    } else if (
      lowerInput.includes("emergency") ||
      lowerInput.includes("contacts")
    ) {
      response =
        "Emergency contacts include local police (911 for emergencies), non-emergency police lines, victim support services, and legal aid. Would you like specific contact information for your area?";
    } else {
      response =
        "I understand you're asking about ' + input + '. Could you provide more details so I can assist you better?";
    }

    return {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
    };
  };

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
        <Text 
          style={[
            styles.messageText, 
            { color: isUserMessage ? "#FFFFFF" : theme.text }
          ]}
        >
          {message.text}
        </Text>
        <Text 
          style={[
            styles.timestampText, 
            { color: isUserMessage ? "rgba(255,255,255,0.7)" : theme.textSecondary }
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
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
          backgroundColor: colorScheme === 'dark' ? 'rgba(74, 144, 226, 0.2)' : '#F0F7FF',
          borderColor: colorScheme === 'dark' ? 'rgba(74, 144, 226, 0.4)' : '#E0E9F7' 
        }
      ]}
      onPress={() => handleTopicSelect(item.title)}
    >
      <Ionicons name={item.icon as any} size={18} color={theme.primary} />
      <Text style={[styles.topicText, { color: theme.primary }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>AI Legal Assistant</Text>
      </View>

      {/* Predefined Topics */}
      <View style={[styles.topicsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.topicsTitle, { color: theme.textSecondary }]}>Common Topics</Text>
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
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.card }]}>
            <Text style={[styles.typingIndicator, { color: theme.textSecondary }]}>AI is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Legal Notice */}
      <View style={[
        styles.noticeContainer, 
        { 
          backgroundColor: theme.noticeBackground, 
          borderTopColor: theme.noticeBorder 
        }
      ]}>
        <Text style={[styles.noticeText, { color: theme.noticeText }]}>
          This AI assistant is not a substitute for professional legal advice.
        </Text>
      </View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: theme.inputBackground, 
              color: theme.text 
            }
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
            { backgroundColor: inputText.trim() ? theme.primary : theme.border }
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={!inputText.trim() ? theme.textSecondary : "white"}
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
});
