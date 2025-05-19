import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { createAccount, signIn, getCurrentSession } from "../../lib/appwrite";
import { usePostHog } from "posthog-react-native";

// App theme colors
const themeColors = {
  light: {
    primary: "#0095F6", // Instagram blue as primary color
    background: "#FAFAFA", // Light background
    card: "#FFFFFF", // White card background
    text: "#262626", // Dark text
    textSecondary: "#8E8E8E", // Gray secondary text
    border: "#DBDBDB", // Light gray border
    inputBackground: "#F2F2F2", // Light gray for input backgrounds
  },
  dark: {
    primary: "#0095F6", // Keep Instagram blue as primary
    background: "#121212", // Dark background
    card: "#1E1E1E", // Dark card background
    text: "#FFFFFF", // White text
    textSecondary: "#ABABAB", // Light gray secondary text
    border: "#2C2C2C", // Dark gray border
    inputBackground: "#2C2C2C", // Dark gray for input backgrounds
  },
};

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("Auth Screen Viewed");
  }, [posthog]);

  // Get theme colors based on color scheme
  const colorScheme = useColorScheme();
  const theme = themeColors[colorScheme === "dark" ? "dark" : "light"];

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match. Please try again.",
      );
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        try {
          // Create account first
          const newName = email.split("@")[0];
          const account = await createAccount(email, password, newName);
          console.log("Account created:", account);

          // Then sign in
          const session = await signIn(email, password);
          console.log("Session created:", session);

          Alert.alert("Success", "Account created successfully!");
          router.replace("/(tabs)");
        } catch (error) {
          console.error("Account creation error:", error);
          Alert.alert(
            "Account Creation Failed",
            error instanceof Error
              ? error.message
              : "Failed to create account. Check if Appwrite is configured correctly.",
          );
        }
      } else {
        await signIn(email, password);
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert(
        "Authentication Failed",
        error instanceof Error
          ? error.message
          : "Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      if (session) {
        router.replace("/(tabs)");
      }
    };

    checkSession();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Crime Patrol
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp ? "Create a new account" : "Sign in to your account"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBackground,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBackground,
                  },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: theme.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesome
                    name={showConfirmPassword ? "eye-slash" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.primary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeContainer}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={[styles.switchModeText, { color: theme.primary }]}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1976D2", // Primary blue color as mentioned in UI guidelines
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  passwordIcon: {
    padding: 12,
  },
  authButton: {
    backgroundColor: "#1976D2", // Primary blue color
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchModeContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  switchModeText: {
    color: "#1976D2",
    fontSize: 16,
  },
});
