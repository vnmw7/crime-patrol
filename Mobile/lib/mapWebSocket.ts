import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

// Backend URL configuration for different environments
const getBackendWsUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === "android") {
      return "http://192.168.254.120:3000"; // Android emulator uses this IP for localhost
    } else {
      return "http://localhost:3000"; // iOS simulator and web
    }
  } else {
    return "https://your-production-backend.com"; // Production URL
  }
};

export interface EmergencyPing {
  $id: string;
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  userId?: string;
  status: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastPing?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface MapWebSocketEvents {
  "emergency-ping-created": (ping: EmergencyPing) => void;
  "emergency-ping-updated": (ping: EmergencyPing) => void;
  "emergency-ping-responded": (ping: EmergencyPing) => void;
  "emergency-ping-ended": (pingId: string) => void;
  "emergency-pings-by-location": (pings: EmergencyPing[]) => void;
  "map-join": () => void;
  "map-leave": () => void;
}

class MapWebSocket {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: { [event: string]: Function[] } = {};

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const backendUrl = getBackendWsUrl();
      console.log(`[MapWebSocket] Connecting to: ${backendUrl}`);

      this.socket = io(backendUrl, {
        transports: ["websocket"],
        timeout: 10000,
        forceNew: false,
      });

      this.socket.on("connect", () => {
        console.log(`[MapWebSocket] Connected with ID: ${this.socket?.id}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Join map room for real-time updates
        this.socket?.emit("map-join");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("[MapWebSocket] Connection error:", error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`[MapWebSocket] Disconnected: ${reason}`);
        this.isConnected = false;

        // Auto-reconnect on unexpected disconnections
        if (reason === "io server disconnect") {
          // Server disconnected, don't auto-reconnect
          return;
        }

        this.handleReconnect();
      });

      // Set up emergency ping event handlers
      this.setupEmergencyPingEventHandlers();
    });
  }
  private setupEmergencyPingEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("emergency-ping-created", (ping: EmergencyPing) => {
      console.log("[MapWebSocket] New emergency ping created:", ping);
      this.notifyListeners("emergency-ping-created", ping);
    });

    this.socket.on("emergency-ping-updated", (ping: EmergencyPing) => {
      console.log("[MapWebSocket] Emergency ping updated:", ping);
      this.notifyListeners("emergency-ping-updated", ping);
    });
    this.socket.on("emergency-ping-responded", (ping: EmergencyPing) => {
      console.log("[MapWebSocket] Emergency ping responded:", ping);
      this.notifyListeners("emergency-ping-responded", ping);
    });
    this.socket.on("emergency-ping-ended", (pingId: string) => {
      console.log("[MapWebSocket] Emergency ping ended:", pingId);
      this.notifyListeners("emergency-ping-ended", pingId);
    });

    this.socket.on("emergency-pings-by-location", (pings: EmergencyPing[]) => {
      console.log(
        "[MapWebSocket] Received emergency pings by location:",
        pings.length,
      );
      this.notifyListeners("emergency-pings-by-location", pings);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[MapWebSocket] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    console.log(
      `[MapWebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("[MapWebSocket] Reconnection failed:", error);
      });
    }, delay);
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners[event] || [];
    eventListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(
          `[MapWebSocket] Error in event listener for ${event}:`,
          error,
        );
      }
    });
  }

  on(event: keyof MapWebSocketEvents, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: keyof MapWebSocketEvents, listener: Function): void {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(listener);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.emit("map-leave");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners = {};
      console.log("[MapWebSocket] Disconnected");
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Method to manually request current emergency pings
  requestEmergencyPings(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("get-active-emergency-pings");
    }
  }

  // Method to request emergency pings by location
  requestEmergencyPingsByLocation(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("get-emergency-pings-by-location", {
        latitude,
        longitude,
        radius,
      });
    }
  }
}

// Export singleton instance
export const mapWebSocket = new MapWebSocket();
