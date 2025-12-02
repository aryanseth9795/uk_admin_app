import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAdminProfile } from "@/api/hooks/useAdmin";
import { useLogout } from "@/api/hooks/useAuth";
import { useThemeMode } from "@/theme/ThemeModeContext";

type Props = NativeStackScreenProps<ControlsStackParamList, "AdminDetails">;

export const AdminDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading } = useAdminProfile();
  const logout = useLogout();
  const { mode, toggle } = useThemeMode();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{"<"} Back</Text>
          </Pressable>
          <Text style={styles.heading}>Account</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {data && (
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={{ flex: 1,display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                <Text style={styles.name}> {data.name}</Text>

                <Text style={styles.meta}>
                  Mobile Number: {data.mobilenumber}
                </Text>
                <Text style={styles.badge}>
                  {" "}
                  Role : {data.role?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Dark mode</Text>
                <Switch
                  value={mode === "dark"}
                  onValueChange={toggle}
                  trackColor={{
                    false: colors.chipBorder,
                    true: colors.tintLight,
                  }}
                  thumbColor={colors.tint}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate("AdminEdit")}
              >
                <Text style={styles.buttonText}>Edit profile</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.dangerButton]}
                onPress={logout}
              >
                <Text style={[styles.buttonText, styles.dangerText]}>
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!isLoading && !data && (
          <>
            <View style={styles.center}>
              <Text style={styles.emptyText}>No admin profile found.</Text>
            </View>
            <Pressable
              style={[styles.button, styles.dangerButton]}
              onPress={logout}
            >
              <Text style={[styles.buttonText, styles.dangerText]}>Logout</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  back: {
    color: colors.muted,
    fontSize: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  card: {

    // flexDirection: "column",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 20,
    alignContent: "center",
    justifyContent: "center",

  },
  profileRow: {
    flexDirection: "row",
    gap: 30,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: colors.chipBg,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.header,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
    // alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.chipBg,
    color: colors.header,
    fontSize: 11,
    fontWeight: "600",
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: colors.text,
  },
  button: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: colors.tint,
  },
  dangerButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dangerText: {
    color: colors.danger,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
});

export default AdminDetailsScreen;
