import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "ControlsHome">;

type ControlCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  onPress: () => void;
};

const ControlCard: React.FC<ControlCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
}) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: iconColor + "20" }]}>
      <Feather name={icon} size={24} color={iconColor} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={colors.muted} />
  </Pressable>
);

export const ControlsHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>UR SHOP</Text>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Controls</Text>

        <View style={styles.cardsContainer}>
          <ControlCard
            title="Reports"
            subtitle="Sales & orders overview"
            icon="bar-chart-2"
            iconColor="#6366F1"
            onPress={() => navigation.navigate("Reports")}
          />

          <ControlCard
            title="Stocks"
            subtitle="Inventory health & management"
            icon="package"
            iconColor="#10B981"
            onPress={() => navigation.navigate("StocksOverview")}
          />

          <ControlCard
            title="Users"
            subtitle="Registered customers"
            icon="users"
            iconColor="#8B5CF6"
            onPress={() => navigation.navigate("Users")}
          />

          <ControlCard
            title="Account"
            subtitle="Admin profile & settings"
            icon="user"
            iconColor="#F59E0B"
            onPress={() => navigation.navigate("AdminDetails")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardsContainer: {
    gap: spacing.sm,
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
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
});
