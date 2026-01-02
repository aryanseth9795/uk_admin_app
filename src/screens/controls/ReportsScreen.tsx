import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { useReport } from "../../api/hooks/useControls";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";

type Props = NativeStackScreenProps<ControlsStackParamList, "Reports">;

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

const getDateLabel = (range: DateRangeKey) => {
  const entry = dateRangeFilters.find((d) => d.key === range);
  return entry?.label ?? "Recent 30";
};

const ReportScreen: React.FC<Props> = ({ navigation }) => {
  const [range, setRange] = useState<DateRangeKey>("recent");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { from, to } = getDateRange(range);
  const { data, isLoading, refetch } = useReport({ from, to });

  const statsArray = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "revenue",
        label: "Revenue",
        value: data.revenue,
        formatted: `₹${data.revenue.toLocaleString("en-IN")}`,
        color: "#10B981",
        icon: "dollar-sign" as keyof typeof Feather.glyphMap,
        iconBg: "#dcfce7",
      },
      {
        key: "totalOrders",
        label: "Total Orders",
        value: data.totalOrders,
        formatted: data.totalOrders.toLocaleString("en-IN"),
        color: "#3B82F6",
        icon: "shopping-bag" as keyof typeof Feather.glyphMap,
        iconBg: "#dbeafe",
      },
      {
        key: "totalProductSales",
        label: "Product Sales",
        value: data.totalProductSales,
        formatted: data.totalProductSales.toLocaleString("en-IN"),
        color: "#F59E0B",
        icon: "package" as keyof typeof Feather.glyphMap,
        iconBg: "#fef3c7",
      },
      {
        key: "totalUsersOrdered",
        label: "Users Ordered",
        value: data.totalUsersOrdered,
        formatted: data.totalUsersOrdered.toLocaleString("en-IN"),
        color: "#A855F7",
        icon: "user-check" as keyof typeof Feather.glyphMap,
        iconBg: "#f3e8ff",
      },
      {
        key: "totalUsersRegistered",
        label: "Users Registered",
        value: data.totalUsersRegistered,
        formatted: data.totalUsersRegistered.toLocaleString("en-IN"),
        color: "#EAB308",
        icon: "users" as keyof typeof Feather.glyphMap,
        iconBg: "#fef9c3",
      },
    ];
  }, [data]);

  const maxValue =
    statsArray.length > 0
      ? Math.max(...statsArray.map((s) => (s.value > 0 ? s.value : 0)), 1)
      : 1;

  const dateSummary = getDateLabel(range);
  const activeRange = dateRangeFilters.find((r) => r.key === range);

  const handleResetFilters = () => {
    setRange("recent");
  };

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
          <Text style={styles.heading}>Reports</Text>
          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Feather name="sliders" size={18} color={colors.text} />
          </Pressable>
        </View>

        {/* Period Summary */}
        <View style={styles.periodCard}>
          <View style={styles.periodHeader}>
            <View
              style={[
                styles.periodIcon,
                {
                  backgroundColor: activeRange?.icon
                    ? colors.primarySoft
                    : colors.bgSoft,
                },
              ]}
            >
              <Feather
                name={activeRange?.icon || "calendar"}
                size={18}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={styles.periodLabel}>Viewing Period</Text>
              <Text style={styles.periodValue}>{dateSummary}</Text>
            </View>
          </View>
          {range !== "recent" && (
            <Pressable onPress={handleResetFilters} style={styles.resetChip}>
              <Text style={styles.resetChipText}>Reset</Text>
            </Pressable>
          )}
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && !data && (
          <View style={styles.center}>
            <Feather
              name="file-text"
              size={48}
              color={colors.muted}
              style={{ marginBottom: spacing.sm }}
            />
            <Text style={styles.emptyText}>No report data available</Text>
          </View>
        )}

        {!isLoading && data && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {statsArray.map((stat, index) => {
                const percent =
                  stat.value > 0 ? (stat.value / maxValue) * 100 : 0;
                const isTopStat = index < 2;

                return (
                  <View
                    key={stat.key}
                    style={[styles.statCard, isTopStat && styles.statCardWide]}
                  >
                    <View
                      style={[
                        styles.statIconCircle,
                        { backgroundColor: stat.iconBg },
                      ]}
                    >
                      <Feather name={stat.icon} size={20} color={stat.color} />
                    </View>

                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={[styles.statValue, { color: stat.color }]}>
                      {stat.formatted}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: stat.color,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.percentText}>
                      {percent.toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
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
                <Text style={styles.modalTitle}>Select Time Period</Text>
                <Pressable
                  onPress={() => setShowFilterModal(false)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* Date Filter Grid */}
              <View style={styles.dateGrid}>
                {dateRangeFilters.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => {
                      setRange(r.key);
                      setShowFilterModal(false);
                    }}
                    style={[
                      styles.dateCard,
                      range === r.key && styles.dateCardActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.dateIconCircle,
                        range === r.key && styles.dateIconCircleActive,
                      ]}
                    >
                      <Feather
                        name={r.icon}
                        size={22}
                        color={range === r.key ? "#FFFFFF" : colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.dateCardText,
                        range === r.key && styles.dateCardTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    {range === r.key && (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                ))}
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
    flex: 1,
    textAlign: "center",
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Period Card
  periodCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  } as any,
  periodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  periodLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  periodValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 2,
  },
  resetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  resetChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  } as any,
  statCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "48.5%",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  statCardWide: {
    width: "100%",
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.bgSoft,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  percentText: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: "600",
  },

  // Modal
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
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },

  dateGrid: {
    gap: spacing.md,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.bgSoft,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  dateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  dateIconCircleActive: {
    backgroundColor: colors.primary,
  },
  dateCardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  dateCardTextActive: {
    fontWeight: "600",
    color: colors.primary,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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

export default ReportScreen;
