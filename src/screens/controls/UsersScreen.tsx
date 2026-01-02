import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { useUsers } from "@/api/hooks/useControls";

type Props = NativeStackScreenProps<ControlsStackParamList, "Users">;

type UserCardProps = {
  item: any;
  isExpanded: boolean;
  onToggleAddresses: () => void;
  onViewOrders: () => void;
};

const UserCard: React.FC<UserCardProps> = ({
  item,
  isExpanded,
  onToggleAddresses,
  onViewOrders,
}) => (
  <View style={styles.card}>
    {/* Top row: main user info */}
    <View style={styles.cardTopRow}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userMobile}>{item.mobilenumber}</Text>
      </View>
    </View>

    {/* User ID */}
    <View style={styles.userIdRow}>
      <Text style={styles.userIdLabel}>User ID:</Text>
      <Text style={styles.userIdValue}>{item._id?.slice(0, 12)}...</Text>
    </View>

    {/* Actions */}
    <View style={styles.actionsRow}>
      <Pressable
        style={[styles.actionButton, isExpanded && styles.actionButtonActive]}
        onPress={onToggleAddresses}
      >
        <Feather
          name="map-pin"
          size={14}
          color={isExpanded ? "#FFFFFF" : colors.muted}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.actionText, isExpanded && styles.actionTextActive]}
        >
          Addresses
        </Text>
      </Pressable>

      <Pressable style={styles.actionButtonOutline} onPress={onViewOrders}>
        <Feather
          name="shopping-bag"
          size={14}
          color={colors.primary}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.actionTextOutline}>Recent Orders</Text>
      </Pressable>
    </View>

    {/* Expanded Addresses */}
    {isExpanded && (
      <View style={styles.addressContainer}>
        {item.addresses && item.addresses.length > 0 ? (
          item.addresses.map((addr: any, idx: number) => (
            <View key={idx} style={styles.addressCard}>
              <View style={styles.addressHeaderRow}>
                <View style={styles.addressLabelBadge}>
                  <Text style={styles.addressLabelText}>{addr.label}</Text>
                </View>
                <Text style={styles.addressName}>{addr.Receiver_Name}</Text>
              </View>
              <Text style={styles.addressLine}>{addr.Address_Line1}</Text>
              {addr.Address_Line2 ? (
                <Text style={styles.addressLine}>{addr.Address_Line2}</Text>
              ) : null}
              <Text style={styles.addressLine}>
                {addr.City} - {addr.pincode}
              </Text>
              <Text style={styles.addressPhone}>
                📞 {addr.Receiver_MobileNumber}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAddressText}>
            No addresses saved for this user.
          </Text>
        )}
      </View>
    )}
  </View>
);

export const UsersScreen: React.FC<Props> = ({ navigation }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: users, isLoading, refetch } = useUsers();

  const toggleAddresses = useCallback((userId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const handleViewOrders = useCallback(
    (userId: string, userName: string) => {
      navigation.navigate("UserOrderHistory", { userId, userName });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <UserCard
        item={item}
        isExpanded={expanded.has(item._id)}
        onToggleAddresses={() => toggleAddresses(item._id)}
        onViewOrders={() => handleViewOrders(item._id, item.name)}
      />
    ),
    [expanded, toggleAddresses, handleViewOrders]
  );

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
          <Text style={styles.heading}>All Users</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && (!users || users.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        )}

        {!!users && users.length > 0 && (
          <>
            <Text style={styles.countText}>
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </Text>
            <FlashList
              data={users}
              keyExtractor={keyExtractor}
              estimatedItemSize={150}
              refreshing={isLoading}
              onRefresh={refetch}
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
              extraData={expanded}
            />
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
    marginBottom: spacing.sm,
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  } as any,
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  userMobile: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  userIdRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  } as any,
  userIdLabel: {
    fontSize: 11,
    color: colors.muted,
    marginRight: spacing.xs,
  },
  userIdValue: {
    fontSize: 11,
    color: colors.text,
    fontWeight: "500",
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    columnGap: spacing.sm,
  } as any,
  actionButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
  },
  actionText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#FFFFFF",
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionTextOutline: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },

  addressContainer: {
    marginTop: spacing.sm,
  },
  addressCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  } as any,
  addressLabelBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: spacing.sm,
  },
  addressLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },
  addressName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  addressLine: {
    fontSize: 11,
    color: colors.text,
    marginTop: 1,
  },
  addressPhone: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  noAddressText: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
  },

  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
});

export default UsersScreen;
