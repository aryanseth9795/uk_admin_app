import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { AppButton } from "@/components/ui/AppButton";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { useAdminLogin } from "@/api/hooks/useAuth";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { registerForPushNotifications } from "@/services/notificationService";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin({
    onSuccess: async () => {
      // Register for push notifications after successful login
      console.log("🔔 Registering for push notifications...");
      const registered = await registerForPushNotifications();
      if (registered) {
        console.log("✅ Push notifications enabled");
      } else {
        console.warn("⚠️ Push notification registration failed (non-blocking)");
      }
    },
  });

  const onSubmit = () => {
    if (!identifier || !password) return;
    const r = loginMutation.mutate({
      mobilenumber: identifier.trim(),
      password,
    });
    // console.log(r)
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>UR Shop Admin</Text>
          <Text style={styles.subtitle}>Login with your admin account</Text>

          <View style={styles.form}>
            <AppTextInput
              label="Email or Phone"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="admin@example.com"
              keyboardType="email-address"
            />
            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <AppButton
              title={loginMutation.isPending ? "Logging in..." : "Login"}
              onPress={onSubmit}
              loading={loginMutation.isPending}
              widthgiven={100}
            />
            {loginMutation.isError && (
              <Text style={styles.errorText}>
                Login failed. Please check credentials.
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  inner: {
    gap: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  form: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  errorText: {
    marginTop: spacing.sm,
    color: "#FCA5A5",
    fontSize: 13,
  },
});
