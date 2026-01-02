import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { useUserOrders, UserOrder } from "@/api/hooks/useControls";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "UserOrderHistory">;

const getStatusBadgeColors = (status: string) => {
  switch (status) {
    case "delivered":
      return { bg: "#dcfce7", text: "#166534" };
    case "shipped":
    case "out_for_delivery":
      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "packed":
    case "processed":
      return { bg: "#fef9c3", text: "#854d0e" };
    case "new_unprocessed":
    default:
      return { bg: "#fee2e2", text: "#991b1b" };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type OrderCardProps = {
  order: UserOrder;
  onPress: () => void;
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const statusLabel = order.status?.replace(/_/g, " ").toUpperCase();
  const badge = getStatusBadgeColors(order.status);
  const orderDate = order.createdAt ? formatDate(order.createdAt) : "";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.orderIdSection}>
          <Text style={styles.cardLabel}>Order ID</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>
            #{order._id?.slice(-8)?.toUpperCase()}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.cardMiddleRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.cardLabel}>Amount</Text>
          <Text style={styles.cardValue}>₹{order.totalAmount?.toFixed(2)}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.cardLabel}>Date</Text>
          <Text style={styles.cardValueSmall}>{orderDate}</Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Text style={styles.cardChevron}>›</Text>
      </View>
    </Pressable>
  );
};

export const UserOrderHistoryScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { userId, userName } = route.params;
  const { data: orders, isLoading, refetch } = useUserOrders(userId);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      // Navigate to OrderDetail in the Orders tab
      navigation.getParent()?.navigate("OrdersTab", {
        screen: "OrderDetail",
        params: { orderId },
      });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: UserOrder) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: UserOrder }) => (
      <OrderCard order={item} onPress={() => handleOrderPress(item._id)} />
    ),
    [handleOrderPress]
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
          <Text style={styles.heading}>Order History</Text>
          <View style={{ width: 60 }} />
        </View>

        {userName && (
          <Text style={styles.userNameText}>Orders by {userName}</Text>
        )}

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No orders found for this user.</Text>
          </View>
        )}

        {!!orders && orders.length > 0 && (
          <>
            <Text style={styles.countText}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </Text>
            <FlashList
              data={orders}
              keyExtractor={keyExtractor}
              estimatedItemSize={140}
              refreshing={isLoading}
              onRefresh={refetch}
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
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
  userNameText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
  listContent: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } as any,
  orderIdSection: {
    flex: 1,
  },
  cardMiddleRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    columnGap: spacing.lg,
  } as any,
  infoBlock: {
    minWidth: 80,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  } as any,
  cardLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.header,
    marginTop: 2,
  },
  cardValueSmall: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "500",
  },
  cardChevron: {
    fontSize: 20,
    color: colors.primary,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default UserOrderHistoryScreen;
