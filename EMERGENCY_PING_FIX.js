// Emergency Ping Fix for index.tsx
// This file contains the corrected emergency ping logic to replace the broken sections

// Add this near the top of the file after imports
let pingCounter = 0;

// Add these state variables in the HomeScreen component
const [shouldContinuePinging, setShouldContinuePinging] = useState(false);

// Add this useEffect for cleanup (replace existing cleanup useEffect)
useEffect(() => {
  return () => {
    console.log("[HomeScreen Unmount] Cleaning up emergency ping resources...");
    setShouldContinuePinging(false);
    if (continuousPingIntervalId) {
      clearInterval(continuousPingIntervalId);
    }
    emergencyWebSocket.disconnect();
  };
}, []); // Empty dependency array - only runs on unmount

// Replace the emergency ping starting logic with this:
if (responseData.data && responseData.data.sessionId) {
  const sessionId = responseData.data.sessionId;
  setCurrentSessionId(sessionId);
  console.log(`[pingLocationToBackend] Session ID stored: ${sessionId}`);

  // Start continuous pinging if not already active
  if (!continuousPingIntervalId) {
    console.log(
      "[pingLocationToBackend] Starting continuous location pinging every 5 seconds."
    );

    // Reset ping counter and set state
    pingCounter = 0;
    setShouldContinuePinging(true);
    setIsContinuousPingingActive(true);

    // Use setTimeout to ensure state is set before starting interval
    setTimeout(() => {
      const intervalId = setInterval(() => {
        sendPeriodicLocationUpdate();
      }, 5000);
      setContinuousPingIntervalId(intervalId);
      console.log(
        `🔄 [CONTINUOUS PING] Started with interval ID: ${intervalId}`
      );
    }, 100);
  }
}

// Replace the sendPeriodicLocationUpdate function with this:
const sendPeriodicLocationUpdate = async () => {
  // Increment ping counter for tracking
  pingCounter += 1;
  const currentPingNumber = pingCounter;

  console.log(
    `\n🔄 [PING #${currentPingNumber}] Starting periodic location update`
  );

  // State checks with detailed logging
  console.log(`🔍 [PING #${currentPingNumber}] State check:`);
  console.log(`   shouldContinuePinging: ${shouldContinuePinging}`);
  console.log(`   isContinuousPingingActive: ${isContinuousPingingActive}`);
  console.log(`   continuousPingIntervalId: ${continuousPingIntervalId}`);
  console.log(`   currentSessionId: ${currentSessionId}`);

  // Exit early if conditions aren't met
  if (!shouldContinuePinging) {
    console.log(
      `❌ [PING #${currentPingNumber}] shouldContinuePinging is false, skipping update`
    );
    return;
  }

  if (!isContinuousPingingActive) {
    console.log(
      `❌ [PING #${currentPingNumber}] isContinuousPingingActive is false, skipping update`
    );
    return;
  }

  console.log(
    `✅ [PING #${currentPingNumber}] State checks passed, proceeding with location update`
  );

  try {
    // Check WebSocket connection
    if (!emergencyWebSocket.isSocketConnected()) {
      console.warn(
        `⚠️ [PING #${currentPingNumber}] WebSocket not connected, skipping update`
      );
      return;
    }

    // Get current location
    let location;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (locationError) {
      console.warn(
        `⚠️ [PING #${currentPingNumber}] High accuracy failed, trying balanced:`,
        locationError
      );
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (fallbackError) {
        console.warn(
          `⚠️ [PING #${currentPingNumber}] Balanced failed, trying low:`,
          fallbackError
        );
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
      }
    }

    if (!location || !location.coords) {
      console.warn(
        `❌ [PING #${currentPingNumber}] Could not obtain location coordinates`
      );
      return;
    }

    const { latitude, longitude } = location.coords;
    const timestamp = new Date().toISOString();

    console.log(
      `📡 [PING #${currentPingNumber}] Sending coordinates: ${latitude.toFixed(
        6
      )}, ${longitude.toFixed(6)}`
    );

    // Send location update via WebSocket
    emergencyWebSocket.sendLocationUpdate({
      latitude,
      longitude,
      timestamp,
      userId: user.isLoggedIn ? user.name : "anonymous",
    });

    console.log(
      `✅ [PING #${currentPingNumber}] Location update sent successfully`
    );

    // Track success with PostHog
    posthog.capture("Periodic Emergency Location Ping Success", {
      latitude,
      longitude,
      accuracy: location.coords.accuracy,
      userId: user.isLoggedIn ? user.name : "anonymous",
      pingNumber: currentPingNumber,
    });
  } catch (error) {
    console.error(
      `❌ [PING #${currentPingNumber}] Error during periodic location update:`,
      error
    );
    posthog.capture("Periodic Emergency Location Ping Error", {
      error: String(error),
      userId: user.isLoggedIn ? user.name : "anonymous",
      pingNumber: currentPingNumber,
    });
  }
};

// Replace the stopContinuousPinging function with this:
const stopContinuousPinging = () => {
  console.log(
    `🛑 [STOP PINGING] Initiating stop sequence... (Total pings sent: ${pingCounter})`
  );

  // Reset ping counter
  pingCounter = 0;

  // Set flag to false immediately
  setShouldContinuePinging(false);

  if (continuousPingIntervalId) {
    clearInterval(continuousPingIntervalId);
    setContinuousPingIntervalId(null);
    setIsContinuousPingingActive(false);
    setCurrentSessionId(null);

    // Disconnect WebSocket
    emergencyWebSocket.disconnect();
    console.log("[stopContinuousPinging] WebSocket disconnected");

    Alert.alert(
      "Pinging Stopped",
      "Continuous location updates have been stopped."
    );

    posthog.capture("Continuous Emergency Ping Stopped", {
      userId: user.isLoggedIn ? user.name : "anonymous",
    });
  }
};

// SOLUTION SUMMARY:
// 1. Added missing pingCounter declaration
// 2. Added shouldContinuePinging state variable
// 3. Fixed state setting timing with setTimeout
// 4. Enhanced logging for debugging
// 5. Proper cleanup in useEffect
// 6. Fixed function structure and syntax errors

// The key fix was ensuring that React state updates have time to complete before
// starting the interval, and using proper state checks in the periodic function.
