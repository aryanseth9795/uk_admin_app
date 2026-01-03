import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { store, persistor } from "@/store";
import { queryClient } from "@/api/queryClient";
import { RootNavigator } from "@/navigation/RootNavigator";
import { colors } from "@/theme/colors";
import { ThemeModeProvider, useThemeMode } from "@/theme/ThemeModeContext";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import {
  configureNotificationHandler,
  registerForPushNotifications,
} from "@/services/notificationService";
import { NavigationContainerRef } from "@react-navigation/native";
import { getTokens } from "@/utils/tokenStorage";

// Configure notification handler on app startup
configureNotificationHandler();

const AppShell: React.FC = () => {
  const { mode } = useThemeMode();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Register push notifications on app startup if user is authenticated
  useEffect(() => {
    console.log(
      "🚀 App.tsx mounted - checking authentication for push notifications..."
    );

    const registerPushOnStartup = async () => {
      try {
        const { accessToken } = await getTokens();
        console.log(
          "🔑 Admin auth token status:",
          accessToken ? "EXISTS" : "NOT FOUND"
        );

        if (accessToken) {
          console.log(
            "🔔 User authenticated, registering for push notifications on startup..."
          );
          const registered = await registerForPushNotifications();
          if (registered) {
            console.log("✅ Push notifications enabled on startup");
          } else {
            console.warn("⚠️ Push notification registration failed on startup");
          }
        } else {
          console.log(
            "ℹ️ No admin token found - skipping push notification registration"
          );
        }
      } catch (error) {
        console.error(
          "Error checking auth status for push notifications:",
          error
        );
      }
    };

    registerPushOnStartup();
  }, []);

  useEffect(() => {
    // Listener for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📱 Notification received:", notification);

        // Extract notification data
        const { title, body } = notification.request.content;

        // Show toast for foreground notifications
        Toast.show({
          type: "info",
          text1: title || "New Notification",
          text2: body || "",
          position: "top",
          visibilityTime: 4000,
        });
      }
    );

    // Listener for notification tap (user taps on notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notification tapped:", response);

        // Extract data from notification
        const data = response.notification.request.content.data;

        // Navigate to order detail if orderId is present
        if (data?.orderId && navigationRef.current) {
          // Navigate to Orders tab and then to OrderDetail screen
          navigationRef.current.navigate("OrdersTab", {
            screen: "OrdersList",
          });

          // Small delay to ensure navigation is ready
          setTimeout(() => {
            navigationRef.current?.navigate("OrdersTab", {
              screen: "OrderDetail",
              params: { orderId: data.orderId },
            });
          }, 100);
        }
      });

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.statusBar }}>
        <StatusBar
          style={mode === "dark" ? "light" : "dark"}
          translucent={false}
          backgroundColor={colors.statusBar}
          // edges={['top']}
        />
        <RootNavigator ref={navigationRef} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <AppShell />
            <Toast />
          </ThemeModeProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
