import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAdminProfile } from "@/api/hooks/useAdmin";
import { useLogout } from "@/api/hooks/useAuth";

type Props = NativeStackScreenProps<ControlsStackParamList, "AdminDetails">;

export const AdminDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading } = useAdminProfile();
  const logout = useLogout();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.heading}>Account</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {data && (
          <View style={styles.card}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {data.name?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>
              <Text style={styles.name}>{data.name}</Text>
              <Text style={styles.meta}>Mobile: {data.mobilenumber}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {data.role?.toUpperCase() || "ADMIN"}
                </Text>
              </View>
            </View>

            {/* Actions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>

              <Pressable
                style={styles.actionRow}
                onPress={() => navigation.navigate("AdminEdit")}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Feather name="edit-2" size={18} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Edit Profile</Text>
                <Feather name="chevron-right" size={20} color={colors.muted} />
              </Pressable>

              <Pressable
                style={[styles.actionRow, styles.dangerRow]}
                onPress={logout}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#fee2e2" }]}
                >
                  <Feather name="log-out" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.actionText, styles.dangerText]}>
                  Logout
                </Text>
                <Feather name="chevron-right" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        )}

        {!isLoading && !data && (
          <>
            <View style={styles.center}>
              <Text style={styles.emptyText}>No admin profile found.</Text>
            </View>
            <Pressable style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
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
    marginTop: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.header,
  },
  meta: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  roleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
  },
  dangerRow: {
    backgroundColor: "#fef2f2",
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  dangerText: {
    color: colors.danger,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
  logoutButton: {
    marginTop: spacing.md,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
});

export default AdminDetailsScreen;
