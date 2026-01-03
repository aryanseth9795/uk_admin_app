import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/env";

// Storage key for expo push token
const EXPO_TOKEN_KEY = "adminExpoToken";

/**
 * Configure how notifications are handled when app is in foreground
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

/**
 * Set up Android notification channels for better notification management
 */
export async function setupAndroidChannels() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Order Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B35",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }
}

/**
 * Request notification permissions from user
 * @returns true if permissions granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Get the Expo push token for this device
 * @returns Expo push token or null if unable to get
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Check if running on a physical device
    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device");
      return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "your-expo-project-id", // TODO: Replace with actual project ID
    });

    return tokenData.data;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return null;
  }
}

/**
 * Register device for push notifications
 * Completes the full flow: permissions -> token -> backend registration
 * @returns true if successful, false otherwise
 */
export async function registerForPushNotifications(): Promise<boolean> {
  try {
    // Step 1: Check device compatibility
    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device");
      return false;
    }

    // Step 2: Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Push notification permissions not granted");
      return false;
    }

    // Step 3: Get Expo push token
    const expoToken = await getExpoPushToken();
    if (!expoToken) {
      console.error("Failed to get Expo push token");
      return false;
    }

    // Step 4: Store token locally
    await AsyncStorage.setItem(EXPO_TOKEN_KEY, expoToken);

    // Step 5: Register token with backend
    const adminAuthToken = await AsyncStorage.getItem("adminAuthToken");
    if (!adminAuthToken) {
      console.error("No admin auth token found");
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/token/expo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAuthToken}`,
      },
      body: JSON.stringify({
        expoToken,
        platform: Platform.OS,
        appType: "admin",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Push notification token registered successfully");

      // Step 6: Set up Android channels
      await setupAndroidChannels();

      return true;
    } else {
      console.error("❌ Failed to register push token with backend:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error registering for push notifications:", error);
    return false;
  }
}

/**
 * Unregister device from push notifications
 * Should be called on logout
 * @returns true if successful, false otherwise
 */
export async function unregisterPushNotifications(): Promise<boolean> {
  try {
    const expoToken = await AsyncStorage.getItem(EXPO_TOKEN_KEY);

    if (!expoToken) {
      console.log("No push token found to unregister");
      return true; // Not an error, just nothing to do
    }

    const adminAuthToken = await AsyncStorage.getItem("adminAuthToken");
    if (!adminAuthToken) {
      console.warn("No admin auth token found for unregistration");
      // Still clear local token
      await AsyncStorage.removeItem(EXPO_TOKEN_KEY);
      return true;
    }

    const response = await fetch(`${API_BASE_URL}/token/expo`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAuthToken}`,
      },
      body: JSON.stringify({ expoToken }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Push notification token unregistered successfully");
      await AsyncStorage.removeItem(EXPO_TOKEN_KEY);
      return true;
    } else {
      console.error("❌ Failed to unregister push token:", data);
      // Still remove local token
      await AsyncStorage.removeItem(EXPO_TOKEN_KEY);
      return false;
    }
  } catch (error) {
    console.error("❌ Error unregistering push notifications:", error);
    // Still attempt to clear local token
    try {
      await AsyncStorage.removeItem(EXPO_TOKEN_KEY);
    } catch (e) {
      console.error("Failed to clear local token:", e);
    }
    return false;
  }
}

/**
 * Get the stored Expo push token from local storage
 * @returns Stored token or null
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EXPO_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting stored push token:", error);
    return null;
  }
}
