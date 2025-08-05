import { io, Socket } from "socket.io-client";
import { getBackendUrl } from "../app/constants/backend";

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  userId?: string;
}

export interface EmergencyWebSocketEvents {
  "emergency-location-update": (
    data: LocationData & { sessionId: string },
  ) => void;
  "emergency-location-updated": (data: {
    sessionId: string;
    timestamp: string;
    success: boolean;
  }) => void;
  "emergency-error": (data: { error: string; message?: string }) => void;
  "join-emergency-session": (sessionId: string) => void;
  "leave-emergency-session": (sessionId: string) => void;
}

class EmergencyWebSocket {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const backendUrl = getBackendUrl();
      console.log(`[EmergencyWebSocket] Connecting to: ${backendUrl}`);

      this.socket = io(backendUrl, {
        transports: ["polling", "websocket"], // Start with polling, then upgrade
        timeout: 10000,
        forceNew: true,
        upgrade: true,
      });

      this.socket.on("connect", () => {
        console.log(
          `[EmergencyWebSocket] Connected with ID: ${this.socket?.id}`,
        );
        console.log(
          `[EmergencyWebSocket] Transport: ${this.socket?.io.engine.transport.name}`,
        );
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("[EmergencyWebSocket] Connection error:", error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`[EmergencyWebSocket] Disconnected: ${reason}`);
        this.isConnected = false;

        // Auto-reconnect on unexpected disconnections
        if (reason === "io server disconnect") {
          // Server disconnected, don't auto-reconnect
          return;
        }

        this.handleReconnect();
      });

      // Log transport upgrades
      this.socket.on("upgrade", () => {
        console.log(
          `[EmergencyWebSocket] Transport upgraded to: ${this.socket?.io.engine.transport.name}`,
        );
      });

      // Set up emergency-specific event handlers
      this.setupEmergencyEventHandlers();
    });
  }

  private setupEmergencyEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("emergency-location-updated", (data) => {
      console.log("[EmergencyWebSocket] Location update confirmed:", data);
    });

    this.socket.on("emergency-error", (data) => {
      console.error("[EmergencyWebSocket] Emergency error:", data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[EmergencyWebSocket] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    console.log(
      `[EmergencyWebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("[EmergencyWebSocket] Reconnection failed:", error);
      });
    }, delay);
  }

  joinEmergencySession(sessionId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error("[EmergencyWebSocket] Cannot join session - not connected");
      return;
    }

    this.sessionId = sessionId;
    this.socket.emit("join-emergency-session", sessionId);
    console.log(`[EmergencyWebSocket] Joined emergency session: ${sessionId}`);
  }

  leaveEmergencySession(): void {
    if (!this.socket || !this.sessionId) {
      return;
    }

    this.socket.emit("leave-emergency-session", this.sessionId);
    console.log(
      `[EmergencyWebSocket] Left emergency session: ${this.sessionId}`,
    );
    this.sessionId = null;
  }

  sendLocationUpdate(locationData: LocationData): void {
    if (!this.socket || !this.isConnected || !this.sessionId) {
      console.error(
        "[EmergencyWebSocket] Cannot send location update - not connected or no session",
      );
      return;
    }

    const updateData = {
      sessionId: this.sessionId,
      ...locationData,
    };

    this.socket.emit("emergency-location-update", updateData);
    console.log(
      `[EmergencyWebSocket] Sent location update for session ${this.sessionId}:`,
      locationData,
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.leaveEmergencySession();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.sessionId = null;
      console.log("[EmergencyWebSocket] Disconnected");
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

// Export singleton instance
export const emergencyWebSocket = new EmergencyWebSocket();
