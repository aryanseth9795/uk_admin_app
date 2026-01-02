import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OrdersStackParamList } from "@/navigation/OrdersNavigator";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import {
  useOrderDetail,
  useUpdateOrderStatus,
  OrderStatus,
} from "@/api/hooks/useOrders";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

const statusFlow: OrderStatus[] = ["placed", "shipped", "delivered"];

const getStatusBadgeColors = (status: string) => {
  switch (status) {
    case "delivered":
      return { bg: "#dcfce7", text: "#166534" };
    case "shipped":
      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "placed":
      return { bg: "#fee2e2", text: "#991b1b" };
    case "cancelled":
      return { bg: "#f3f4f6", text: "#374151" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const normalizeStatus = (status: string): OrderStatus => {
  const normalizedKey = status.toLowerCase();
  switch (normalizedKey) {
    case "new_unprocessed":
    case "placed":
    case "pending":
    case "processing":
    case "packed":
      return "placed";
    case "out_for_delivery":
    case "shipped":
      return "shipped";
    default:
      return normalizedKey as OrderStatus;
  }
};

const getAvailableActions = (currentStatus: OrderStatus) => {
  switch (currentStatus) {
    case "placed":
      return [
        { label: "Cancel Order", status: "cancelled", color: colors.danger },
        { label: "Mark Shipped", status: "shipped", color: colors.primary },
      ];
    case "shipped":
      return [
        { label: "Cancel Order", status: "cancelled", color: colors.danger },
        {
          label: "Mark Delivered",
          status: "delivered",
          color: colors.success, // Custom green for delivery
        },
      ];
    default:
      return [];
  }
};

const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { data: order, isLoading, refetch } = useOrderDetail(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [isUpdating, setIsUpdating] = useState(false);

  const imageUrl = (thumb?: { secureUrl?: string; url?: string }) =>
    thumb?.secureUrl || thumb?.url || undefined;

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this order as "${getStatusLabel(
        newStatus
      )}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsUpdating(true);
            try {
              await updateStatus.mutateAsync({
                orderId,
                status: newStatus,
              });
              Alert.alert(
                "Success",
                `Order status updated to ${getStatusLabel(newStatus)}`
              );
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Failed to update status");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    // Navigate to ProductDetail in Products tab
    navigation.getParent()?.navigate("ProductsTab", {
      screen: "ProductDetail",
      params: { productId },
    });
  };

  const rawStatus = order?.status || "pending";
  const currentStatus = normalizeStatus(rawStatus);
  const statusBadge = getStatusBadgeColors(currentStatus);
  const availableActions = currentStatus
    ? getAvailableActions(currentStatus)
    : [];

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
          <Text style={styles.heading}>Order Details</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && !order && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && !order && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Order not found.</Text>
          </View>
        )}

        {order && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Order Status Card */}
            <View style={styles.card}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Order Status</Text>
                  <Text style={styles.orderIdFull}>#{orderId}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusBadge.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: statusBadge.text },
                    ]}
                  >
                    {currentStatus ? getStatusLabel(currentStatus) : "Unknown"}
                  </Text>
                </View>
              </View>

              {order.createdAt && (
                <View style={styles.dateRow}>
                  <Text style={styles.label}>Placed on</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
              )}
            </View>

            {/* Customer + Summary */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>{order.name}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Mobile</Text>
                  <Text style={styles.value}>{order.mobilenumber}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Total Amount</Text>
                  <Text style={styles.valueAccent}>
                    ₹{order.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>No. of Products</Text>
                  <Text style={styles.value}>{order.noOfProducts}</Text>
                </View>
              </View>
            </View>

            {/* Address */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <View style={styles.addressLabelBadge}>
                <Text style={styles.addressLabelText}>
                  {order.address.label}
                </Text>
              </View>
              <Text style={styles.addressName}>
                {order.address.Receiver_Name}
              </Text>
              <Text style={styles.addressLine}>
                {order.address.Address_Line1}
              </Text>
              {order.address.Address_Line2 ? (
                <Text style={styles.addressLine}>
                  {order.address.Address_Line2}
                </Text>
              ) : null}
              <Text style={styles.addressLine}>
                {order.address.City} - {order.address.pincode}
              </Text>
              <Text style={styles.addressPhone}>
                📞 {order.address.Receiver_MobileNumber}
              </Text>
            </View>

            {/* Items */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Items ({order.products.length})
              </Text>

              {order.products.map((item, index) => {
                const uri = imageUrl(item.thumbnail);
                const productId = (item as any).productId || item._id;

                return (
                  <Pressable
                    key={item._id + index}
                    style={styles.itemRow}
                    onPress={() => handleProductPress(productId)}
                  >
                    <View style={styles.thumbWrapper}>
                      {uri ? (
                        <Image
                          source={{ uri }}
                          style={styles.thumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder}>
                          <Text style={styles.thumbPlaceholderText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemSub}>
                        Variant: {item.variantId.toString().slice(0, 8)}
                      </Text>
                    </View>

                    <View style={styles.itemQtyBox}>
                      <Text style={styles.itemQtyLabel}>Qty</Text>
                      <Text style={styles.itemQtyValue}>{item.quantity}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Spacer for bottom actions */}
            <View style={{ height: 140 }} />
          </ScrollView>
        )}

        {/* Bottom Action Buttons */}
        {order && availableActions.length > 0 && (
          <View style={styles.bottomActions}>
            <View style={styles.actionButtonsRow}>
              {availableActions.map((action) => (
                <Pressable
                  key={action.status}
                  style={[
                    styles.actionButton,
                    { backgroundColor: action.color },
                    availableActions.length > 1 && { flex: 1 },
                    isUpdating && styles.actionButtonDisabled,
                  ]}
                  onPress={() =>
                    handleStatusUpdate(action.status as OrderStatus)
                  }
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {order && availableActions.length === 0 && (
          <View style={styles.bottomActions}>
            <View
              style={[
                styles.completedBanner,
                currentStatus === "cancelled" && { backgroundColor: "#f3f4f6" },
              ]}
            >
              <Text
                style={[
                  styles.completedText,
                  currentStatus === "cancelled" && { color: "#374151" },
                ]}
              >
                {currentStatus === "cancelled"
                  ? "✕ Order Cancelled"
                  : "✓ Order Completed"}
              </Text>
            </View>
          </View>
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Status Header
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  } as any,
  orderIdFull: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  } as any,
  dateValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
  },

  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.header,
    marginBottom: spacing.xs,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  } as any,
  label: {
    fontSize: 11,
    color: colors.muted,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  valueAccent: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.header,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // Address
  addressLabelBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: spacing.xs,
  },
  addressLabelText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  addressLine: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  // Items - Clickable
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.bgSoft,
  },
  thumbWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: spacing.sm,
    backgroundColor: colors.bg,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.header,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
  },
  itemSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  itemQtyBox: {
    alignItems: "flex-end",
    minWidth: 44,
  },
  itemQtyLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  itemQtyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.header,
    marginTop: 2,
  },

  // Bottom Actions
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsContent: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  quickActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  completedBanner: {
    backgroundColor: "#dcfce7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  completedText: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "600",
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

export default OrderDetailScreen;
