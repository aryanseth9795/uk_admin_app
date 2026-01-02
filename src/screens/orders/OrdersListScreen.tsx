import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";
import { OrdersStackParamList } from "@/navigation/OrdersNavigator";
import { useOrders, OrderStatus } from "@/api/hooks/useOrders";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrdersList">;

const statusFilters: {
  key: OrderStatus | "all";
  label: string;
  color: string;
}[] = [
  { key: "all", label: "All Orders", color: "#6366F1" },
  { key: "placed", label: "Placed", color: "#EF4444" },
  { key: "shipped", label: "Shipped", color: "#3B82F6" },
  { key: "delivered", label: "Delivered", color: "#10B981" },
  { key: "cancelled", label: "Cancelled", color: "#6B7280" },
];

type DateRangeKey =
  | "recent"
  | "today"
  | "yesterday"
  | "last_3_days"
  | "last_7_days";

const dateRangeFilters: {
  key: DateRangeKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "recent", label: "Recent 30", icon: "clock" },
  { key: "today", label: "Today", icon: "calendar" },
  { key: "yesterday", label: "Yesterday", icon: "chevron-left" },
  { key: "last_3_days", label: "Last 3 Days", icon: "trending-down" },
  { key: "last_7_days", label: "Last 7 Days", icon: "bar-chart-2" },
];

const getDateRange = (range: DateRangeKey): { from?: string; to?: string } => {
  if (range === "recent") return {};

  const now = new Date();
  const end = new Date(now);

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (range === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const yEnd = new Date();
    yEnd.setDate(yEnd.getDate() - 1);
    yEnd.setHours(23, 59, 59, 999);

    return { from: start.toISOString(), to: yEnd.toISOString() };
  }

  if (range === "last_3_days") {
    const start = new Date();
    start.setDate(start.getDate() - 3);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
};

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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

// Memoized Order Card component
const OrderCard = React.memo(
  ({ item, onPress }: { item: any; onPress: () => void }) => {
    const rawStatus = item.status || "pending";
    const normalizedStatus = normalizeStatus(rawStatus);

    // Use normalized status for label and badge
    const statusLabel =
      normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
    const badge = getStatusBadgeColors(normalizedStatus);
    const orderDate = item.createdAt ? formatDate(item.createdAt) : "";

    return (
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.orderIdSection}>
            <Text style={styles.cardLabel}>Order ID</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              #{item?._id?.slice(-8)?.toUpperCase()}
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
            <Text style={styles.cardValue}>
              ₹{item.totalAmount?.toFixed(2)}
            </Text>
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
  }
);

export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const [status, setStatus] =
    useState<(typeof statusFilters)[number]["key"]>("all");
  const [range, setRange] = useState<DateRangeKey>("recent");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { from, to } = getDateRange(range);
  const { data: orders, isLoading, refetch } = useOrders({ status, from, to });

  const handleResetFilters = useCallback(() => {
    setStatus("all");
    setRange("recent");
  }, []);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate("OrderDetail", { orderId });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <OrderCard item={item} onPress={() => handleOrderPress(item._id)} />
    ),
    [handleOrderPress]
  );

  const activeStatus = statusFilters.find((s) => s.key === status);
  const activeRange = dateRangeFilters.find((r) => r.key === range);
  const hasActiveFilters = status !== "all" || range !== "recent";

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>UR SHOP</Text>
        </View>

        {/* Section Title with Filter Button */}
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <Pressable
            style={[
              styles.filterToggleButton,
              hasActiveFilters && styles.filterToggleActive,
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Feather
              name="filter"
              size={16}
              color={hasActiveFilters ? "#FFFFFF" : colors.text}
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </Pressable>
        </View>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <View style={styles.filterSummary}>
            <View
              style={[
                styles.summaryChip,
                { backgroundColor: activeStatus?.color + "20" },
              ]}
            >
              <Text
                style={[styles.summaryText, { color: activeStatus?.color }]}
              >
                {activeStatus?.label}
              </Text>
            </View>
            <View style={styles.summaryChip}>
              <Feather
                name={activeRange?.icon || "clock"}
                size={12}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                {activeRange?.label}
              </Text>
            </View>
            <Pressable onPress={handleResetFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          </View>
        )}

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <View style={styles.center}>
            <Feather
              name="inbox"
              size={48}
              color={colors.muted}
              style={{ marginBottom: spacing.sm }}
            />
            <Text style={styles.emptyText}>No orders found</Text>
            {hasActiveFilters && (
              <Pressable
                onPress={handleResetFilters}
                style={{ marginTop: spacing.sm }}
              >
                <Text style={styles.clearAllText}>Try resetting filters</Text>
              </Pressable>
            )}
          </View>
        )}

        {!!orders && orders.length > 0 && (
          <FlashList
            data={orders}
            keyExtractor={keyExtractor}
            // estimatedItemSize={140}
            refreshing={isLoading}
            onRefresh={refetch}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowFilterModal(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Orders</Text>
                <Pressable
                  onPress={() => setShowFilterModal(false)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* Status Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Order Status</Text>
                <View style={styles.filterGrid}>
                  {statusFilters.map((s) => (
                    <Pressable
                      key={s.key}
                      onPress={() => setStatus(s.key)}
                      style={[
                        styles.statusFilterCard,
                        status === s.key && [
                          styles.statusFilterCardActive,
                          {
                            borderColor: s.color,
                            backgroundColor: s.color + "15",
                          },
                        ],
                      ]}
                    >
                      <View
                        style={[styles.statusDot, { backgroundColor: s.color }]}
                      />
                      <Text
                        style={[
                          styles.statusFilterText,
                          status === s.key && {
                            color: s.color,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {s.label}
                      </Text>
                      {status === s.key && (
                        <Feather
                          name="check-circle"
                          size={18}
                          color={s.color}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Time Period</Text>
                <View style={styles.dateGrid}>
                  {dateRangeFilters.map((r) => (
                    <Pressable
                      key={r.key}
                      onPress={() => setRange(r.key)}
                      style={[
                        styles.dateFilterCard,
                        range === r.key && styles.dateFilterCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          range === r.key && styles.iconCircleActive,
                        ]}
                      >
                        <Feather
                          name={r.icon}
                          size={18}
                          color={range === r.key ? "#FFFFFF" : colors.primary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.dateFilterText,
                          range === r.key && styles.dateFilterTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                >
                  <Text style={styles.resetButtonText}>Reset All</Text>
                </Pressable>
                <Pressable
                  style={styles.applyButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.primary,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  filterToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: colors.primary,
  },

  // Filter Summary
  filterSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  } as any,
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  clearAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },

  // Filter Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },

  filterGroup: {
    marginBottom: spacing.lg,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterGrid: {
    gap: spacing.sm,
  },
  statusFilterCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.bgSoft,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statusFilterCardActive: {
    borderWidth: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusFilterText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  } as any,
  dateFilterCard: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.bgSoft,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 100,
  },
  dateFilterCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  iconCircleActive: {
    backgroundColor: colors.primary,
  },
  dateFilterText: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
  },
  dateFilterTextActive: {
    fontWeight: "600",
    color: colors.primary,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  } as any,
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  listContent: {
    paddingTop: spacing.sm,
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

  center: {
    paddingVertical: spacing.lg * 2,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
});
