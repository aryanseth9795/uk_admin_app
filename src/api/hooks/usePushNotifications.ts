import { useMutation, useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/env";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Register Expo push token with backend
 */
async function registerPushToken(data: {
  expoToken: string;
  platform?: string;
  appType: "admin";
  deviceId?: string;
}) {
  const token = await AsyncStorage.getItem("adminAuthToken");

  const response = await fetch(`${API_BASE_URL}/token/expo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register push token");
  }

  return response.json();
}

/**
 * Unregister Expo push token from backend
 */
async function unregisterPushToken(expoToken: string) {
  const token = await AsyncStorage.getItem("adminAuthToken");

  const response = await fetch(`${API_BASE_URL}/token/expo`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expoToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to unregister push token");
  }

  return response.json();
}

/**
 * Get all registered admin tokens (debug endpoint)
 */
async function getAdminTokens() {
  const token = await AsyncStorage.getItem("adminAuthToken");

  const response = await fetch(`${API_BASE_URL}/token/expo`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get admin tokens");
  }

  return response.json();
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to register push token
 */
export function useRegisterPushToken() {
  return useMutation({
    mutationFn: registerPushToken,
    onSuccess: (data) => {
      console.log("Push token registered:", data);
    },
    onError: (error: Error) => {
      console.error("Failed to register push token:", error.message);
    },
  });
}

/**
 * Hook to unregister push token
 */
export function useUnregisterPushToken() {
  return useMutation({
    mutationFn: unregisterPushToken,
    onSuccess: (data) => {
      console.log("Push token unregistered:", data);
    },
    onError: (error: Error) => {
      console.error("Failed to unregister push token:", error.message);
    },
  });
}

/**
 * Hook to get all admin tokens (for debugging)
 */
export function useGetAdminTokens() {
  return useQuery({
    queryKey: ["adminPushTokens"],
    queryFn: getAdminTokens,
    enabled: false, // Only fetch when explicitly called
  });
}
