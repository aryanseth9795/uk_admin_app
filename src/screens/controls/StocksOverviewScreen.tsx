import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { useProductStats } from "@/api/hooks/useControls";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "StocksOverview">;

type StatCardProps = {
  label: string;
  value: number | string;
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
  iconColor: string;
  onPress?: () => void;
  disabled?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  onPress,
  disabled = false,
}) => {
  const Component = disabled ? View : Pressable;

  return (
    <Component
      style={[styles.card, disabled && styles.cardDisabled]}
      {...(!disabled && { onPress })}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      {!disabled && (
        <Feather name="chevron-right" size={20} color={colors.muted} />
      )}
    </Component>
  );
};

export const StocksOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, error } = useProductStats(2);

  console.log(
    "StocksOverview - Loading:",
    isLoading,
    "Data:",
    data,
    "Error:",
    error
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
          <Text style={styles.heading}>Stock Management</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading stock data...</Text>
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.center}>
            <Feather
              name="alert-circle"
              size={48}
              color={colors.danger}
              style={{ marginBottom: spacing.sm }}
            />
            <Text style={styles.errorText}>Failed to load stock data</Text>
            <Text style={styles.errorSubtext}>
              {error?.message || "Please try again"}
            </Text>
          </View>
        )}

        {!isLoading && !error && !data && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No stock data available</Text>
          </View>
        )}

        {data && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cards}>
              {/* Alert Section */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="alert-triangle"
                  size={18}
                  color={colors.warning}
                />
                <Text style={styles.sectionText}>Stock Alerts</Text>
              </View>

              <StatCard
                label="Out of Stock"
                value={data.outOfStockProducts}
                icon="alert-circle"
                iconBg="#fee2e2"
                iconColor="#dc2626"
                onPress={() =>
                  navigation.navigate("StockList", {
                    type: "out-of-stock",
                    title: "Out of Stock",
                  })
                }
              />

              <StatCard
                label="Low Stock"
                value={data.lowStockProducts}
                icon="alert-triangle"
                iconBg="#fef9c3"
                iconColor="#ca8a04"
                onPress={() =>
                  navigation.navigate("StockList", {
                    type: "low-stock",
                    title: "Low Stock",
                  })
                }
              />

              {/* Overview Section */}
              <View style={styles.sectionHeader}>
                <Feather name="pie-chart" size={18} color={colors.primary} />
                <Text style={styles.sectionText}>Overview</Text>
              </View>

              <StatCard
                label="Total Products"
                value={data.totalProducts}
                icon="package"
                iconBg="#dbeafe"
                iconColor="#2563eb"
                disabled
              />

              <StatCard
                label="In Stock Products"
                value={data.inStockProducts}
                icon="check-circle"
                iconBg="#dcfce7"
                iconColor="#16a34a"
                disabled
              />

              <StatCard
                label="Active Products"
                value={data.activeProducts}
                icon="trending-up"
                iconBg="#f3e8ff"
                iconColor="#9333ea"
                disabled
              />

              {/* Quick Access Section */}
              <View style={styles.sectionHeader}>
                <Feather name="zap" size={18} color={colors.accent} />
                <Text style={styles.sectionText}>Quick Access</Text>
              </View>

              <StatCard
                label="Browse by Brand"
                value="View all"
                icon="tag"
                iconBg="#fef3c7"
                iconColor="#f59e0b"
                onPress={() => navigation.navigate("BrandsList")}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.muted,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  cards: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  sectionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  cardValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
});

export default StocksOverviewScreen;
