import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { ControlsStackParamList } from "@/navigation/ControlsNavigator";
import { useGetAdminProductList } from "@/api/hooks/useAdmin";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

type Props = NativeStackScreenProps<ControlsStackParamList, "BrandProducts">;

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;

export const BrandProductsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { brandName } = route.params;

  const { data, isLoading, refetch } = useGetAdminProductList({
    brand: brandName,
    page: 1,
  });

  const products = data?.products || [];

  const handleProductPress = useCallback(
    (productId: string) => {
      // Navigate to ProductDetail in the SAME stack
      navigation.navigate("ProductDetail", { productId });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const primaryVariant = item.variants?.[0];
      const stock = primaryVariant?.stock ?? 0;
      const firstTier = primaryVariant?.sellingPrices?.[0];
      const sellingPrice = firstTier?.price ?? primaryVariant?.mrp ?? 0;
      const thumbUrl = item.thumbnail?.secureUrl || item.thumbnail?.url || "";

      return (
        <Pressable
          style={styles.card}
          onPress={() => handleProductPress(item._id)}
        >
          <View style={styles.thumbnailWrapper}>
            {thumbUrl ? (
              <Image
                source={{ uri: thumbUrl }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Text style={{ color: colors.textMuted }}>No image</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={2} style={styles.name}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{Number(sellingPrice).toFixed(2)}</Text>
          </View>

          <View
            style={[
              styles.stockChip,
              stock > 0 ? styles.stockOk : styles.stockOut,
            ]}
          >
            <Text style={styles.stockText}>
              {stock > 0 ? `In stock (${stock})` : "Out of stock"}
            </Text>
          </View>
        </Pressable>
      );
    },
    [handleProductPress]
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
          <Text style={styles.heading} numberOfLines={1}>
            {brandName}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && products.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No products found for this brand.
            </Text>
          </View>
        )}

        {products.length > 0 && (
          <>
            <Text style={styles.countText}>
              {data?.totalProducts || products.length} products
            </Text>
            <FlashList
              data={products}
              keyExtractor={keyExtractor}
              numColumns={2}
              // estimatedItemSize={220}
              refreshing={isLoading}
              onRefresh={refetch}
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
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
    width: CARD_WIDTH,
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  thumbnailWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.bgSoft,
    marginBottom: spacing.xs,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.header,
  },
  stockChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  stockOk: {
    backgroundColor: "#dcfce7",
  },
  stockOut: {
    backgroundColor: "#fee2e2",
  },
  stockText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
  },
});

export default BrandProductsScreen;
