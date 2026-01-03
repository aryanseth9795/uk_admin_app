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
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { useBrandStats } from "@/api/hooks/useControls";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "BrandsList">;

type BrandCardProps = {
  brand: string;
  totalProducts: number;
  onPress: () => void;
};

const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  totalProducts,
  onPress,
}) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.brandIcon}>
      <Text style={styles.brandInitial}>{brand.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.brandName}>{brand}</Text>
      <Text style={styles.productCount}>
        {totalProducts} {totalProducts === 1 ? "product" : "products"}
      </Text>
    </View>
    <Feather name="chevron-right" size={20} color={colors.muted} />
  </Pressable>
);

export const BrandsListScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, refetch } = useBrandStats();

  const handleBrandPress = useCallback(
    (brandName: string) => {
      navigation.navigate("BrandProducts", { brandName });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item.brand, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <BrandCard
        brand={item.brand}
        totalProducts={item.totalProducts}
        onPress={() => handleBrandPress(item.brand)}
      />
    ),
    [handleBrandPress]
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
          <Text style={styles.heading}>All Brands</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No brands found.</Text>
          </View>
        )}

        {!!data && data.length > 0 && (
          <>
            <Text style={styles.countText}>
              {data.length} {data.length === 1 ? "brand" : "brands"} found
            </Text>
            <FlashList
              data={data}
              keyExtractor={keyExtractor}
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
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  brandInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  cardContent: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  productCount: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
});

export default BrandsListScreen;
