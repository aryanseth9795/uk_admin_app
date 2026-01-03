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
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import {
  useOutOfStockProducts,
  useLowStockProducts,
} from "@/api/hooks/useControls";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "StockList">;

type ProductCardProps = {
  item: any;
  stockType: string;
  onPress: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  stockType,
  onPress,
}) => {
  const thumbUrl = item.thumbnail?.secureUrl || item.thumbnail?.url || "";

  // Get the minimum stock across all variants
  const minStock =
    item.variants?.reduce(
      (min: number, variant: any) => Math.min(min, variant.stock || 0),
      Infinity
    ) || 0;

  const isOutOfStock = stockType === "out-of-stock";
  const isLowStock = stockType === "low-stock";

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumbWrapper}>
        {thumbUrl ? (
          <Image
            source={{ uri: thumbUrl }}
            style={styles.thumb}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbPlaceholderText}>
              {item.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text numberOfLines={2} style={styles.productName}>
          {item.name}
        </Text>
        {item.brand && <Text style={styles.brandText}>{item.brand}</Text>}
        <View style={styles.stockRow}>
          <View
            style={[
              styles.stockBadge,
              isOutOfStock
                ? styles.stockBadgeRed
                : isLowStock
                ? styles.stockBadgeAmber
                : styles.stockBadgeGreen,
            ]}
          >
            <Text
              style={[
                styles.stockBadgeText,
                isOutOfStock
                  ? styles.stockTextRed
                  : isLowStock
                  ? styles.stockTextAmber
                  : styles.stockTextGreen,
              ]}
            >
              {isOutOfStock ? "Out of stock" : `Stock: ${minStock}`}
            </Text>
          </View>
        </View>
      </View>

      <Feather name="chevron-right" size={20} color={colors.muted} />
    </Pressable>
  );
};

export const StockListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { type, title } = route.params;

  const isOutOfStock = type === "out-of-stock";
  const isLowStock = type === "low-stock";

  // Call hooks conditionally but always in the same order
  const outOfStockQuery = useOutOfStockProducts();
  const lowStockQuery = useLowStockProducts(2);

  // Select the appropriate query result
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = isOutOfStock ? outOfStockQuery : lowStockQuery;

  // Flatten products from all pages
  const products = data?.pages.flatMap((page) => page.products || []) || [];
  const totalCount = data?.pages[0]?.total || 0;
  const currentPageCount = data?.pages.length || 0;

  const handleProductPress = useCallback(
    (productId: string) => {
      // Navigate to ProductDetail in the SAME stack to keep back history
      navigation.navigate("ProductDetail", { productId });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        item={item}
        stockType={type}
        onPress={() => handleProductPress(item._id)}
      />
    ),
    [handleProductPress, type]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, type]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

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
          <Text style={styles.heading}>{title}</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!!products && products.length > 0 && (
          <>
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {products.length}
                {totalCount > products.length && ` of ${totalCount}`}{" "}
                {products.length === 1 ? "product" : "products"}
              </Text>
              <Pressable onPress={() => refetch()} style={styles.refreshButton}>
                <Feather name="refresh-cw" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <FlashList
              data={products}
              keyExtractor={keyExtractor}
              refreshing={isLoading}
              onRefresh={refetch}
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          </>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <View style={styles.center}>
            <Feather
              name={isOutOfStock ? "check-circle" : "package"}
              size={48}
              color={colors.success}
              style={{ marginBottom: spacing.sm }}
            />
            <Text style={styles.emptyTitle}>
              {isOutOfStock ? "All Good!" : "No Issues"}
            </Text>
            <Text style={styles.emptyText}>
              {isOutOfStock
                ? "No products are currently out of stock"
                : "No products with low stock"}
            </Text>
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
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  center: {
    paddingVertical: spacing.lg * 2,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.success,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
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
  thumbWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.bgSoft,
    marginRight: spacing.md,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  brandText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  stockRow: {
    marginTop: spacing.xs,
  },
  stockBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  stockBadgeRed: {
    backgroundColor: "#fee2e2",
  },
  stockBadgeAmber: {
    backgroundColor: "#fef9c3",
  },
  stockBadgeGreen: {
    backgroundColor: "#dcfce7",
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  stockTextRed: {
    color: "#dc2626",
  },
  stockTextAmber: {
    color: "#ca8a04",
  },
  stockTextGreen: {
    color: "#16a34a",
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
  },
});
