import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated as RNAnimated,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  FadeInUp,
  FadeOut,
  Layout,
  FadeInRight,
  SlideInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ProductsStackParamList } from "@/navigation/ProductsNavigator";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/theme";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Image } from "expo-image";
import { useGetAdminProductList } from "@/api/hooks/useAdmin";

type Props = NativeStackScreenProps<ProductsStackParamList, "ProductsList">;

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;
const CARD_HEIGHT = CARD_WIDTH + 120;

// Filter state management with useReducer for batched updates
interface FilterState {
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
  brand?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

type FilterAction =
  | { type: "SET_FILTERS"; payload: FilterState }
  | { type: "RESET_FILTERS" };

const filterReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case "SET_FILTERS":
      return { ...action.payload };
    case "RESET_FILTERS":
      return {};
    default:
      return state;
  }
};

export const ProductsListScreen: React.FC<Props> = ({ navigation }) => {
  // search: input vs applied (to API)
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // applied filters (used in API) - now using useReducer for batched updates
  const [filters, dispatchFilters] = useReducer(filterReducer, {});

  const [page, setPage] = useState(1);

  // filter panel UI state (draft)
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // FAB rotation animation
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [filterSubSubCategory, setFilterSubSubCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterTags, setFilterTags] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterInStock, setFilterInStock] = useState(false);

  // aggregated list for infinite scroll
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // SEARCH MODE: search OR filters
  const isSearchMode = search.trim().length > 0;

  const { data, isLoading, isFetching, refetch } = useGetAdminProductList({
    page,
    search: isSearchMode ? search.trim() : undefined,
    category: isSearchMode ? undefined : filters.category,
    subCategory: isSearchMode ? undefined : filters.subCategory,
    subSubCategory: isSearchMode ? undefined : filters.subSubCategory,
    brand: isSearchMode ? undefined : filters.brand,
    tags: isSearchMode ? undefined : filters.tags,
    minPrice: isSearchMode ? undefined : filters.minPrice,
    maxPrice: isSearchMode ? undefined : filters.maxPrice,
    inStock: isSearchMode ? undefined : filters.inStock,
  });

  const hasNextPage = data?.hasNextPage ?? false;

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.subSubCategory,
    filters.brand,
    filters.tags,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock === "true" ? "inStock" : null,
  ].filter(Boolean).length;

  const isInitialLoading =
    (isLoading || (isFetching && page === 1)) && products.length === 0;

  const isLoadingMore = isFetching && page > 1;

  // sync aggregated products when data changes
  useEffect(() => {
    if (!data?.products) return;

    const serverProducts = data.products;

    if (page === 1) {
      setProducts(serverProducts);
    } else {
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newOnes = serverProducts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newOnes];
      });
    }
  }, [data, page]);

  // stop refreshing when new data has finished fetching
  useEffect(() => {
    if (!isFetching && refreshing) {
      setRefreshing(false);
    }
  }, [isFetching, refreshing]);

  // ---- helpers to reset ----
  const resetFiltersUI = useCallback(() => {
    setFilterCategory("");
    setFilterSubCategory("");
    setFilterSubSubCategory("");
    setFilterBrand("");
    setFilterTags("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterInStock(false);
  }, []);

  const resetAllQueryState = useCallback(() => {
    setSearch("");
    setSearchInput("");
    dispatchFilters({ type: "RESET_FILTERS" });
    resetFiltersUI();
    setPage(1);
    setProducts([]);
    setShowFilters(false);
  }, [resetFiltersUI]);

  // ---- Search handlers ----
  const handleSearchChange = (text: string) => {
    setSearchInput(text);
  };

  const handleSearchSubmit = () => {
    // Manual submit only (when user clicks search button or presses enter)
    const trimmedInput = searchInput.trim();

    // Reset to all products if search is cleared
    if (trimmedInput.length === 0 && search !== "") {
      setSearch("");
      setProducts([]);
      setPage(1);
      return;
    }

    // Apply new search
    if (trimmedInput !== search) {
      setProducts([]);
      setPage(1);
      dispatchFilters({ type: "RESET_FILTERS" });
      resetFiltersUI();
      setShowFilters(false);
      setSearch(trimmedInput);
    }
  };

  // when search or filters are active, show clear capability
  const hasActiveQuery = search.trim().length > 0 || activeFilterCount > 0;

  const handleClearAll = () => {
    resetAllQueryState();
  };

  // ---- Filter handlers ----
  const handleToggleFilters = () => {
    setShowFilters(true);

    // init draft values from applied filters (don't clear search here)
    setFilterCategory(filters.category ?? "");
    setFilterSubCategory(filters.subCategory ?? "");
    setFilterSubSubCategory(filters.subSubCategory ?? "");
    setFilterBrand(filters.brand ?? "");
    setFilterTags(filters.tags ?? "");
    setFilterMinPrice(filters.minPrice ?? "");
    setFilterMaxPrice(filters.maxPrice ?? "");
    setFilterInStock(filters.inStock === "true");
  };

  const handleApplyFilters = () => {
    // Build filter payload
    const newFilters = {
      category: filterCategory.trim() || undefined,
      subCategory: filterSubCategory.trim() || undefined,
      subSubCategory: filterSubSubCategory.trim() || undefined,
      brand: filterBrand.trim() || undefined,
      tags: filterTags.trim() || undefined,
      minPrice: filterMinPrice.trim() || undefined,
      maxPrice: filterMaxPrice.trim() || undefined,
      inStock: filterInStock ? "true" : undefined,
    };

    // Check if any filters are actually set
    const hasAnyFilter = Object.values(newFilters).some(
      (val) => val !== undefined
    );

    // Only clear search and reset if filters are actually being applied
    if (hasAnyFilter) {
      setProducts([]);
      setPage(1);
      setSearch("");
      setSearchInput("");

      // Batch all filter updates in one action
      dispatchFilters({
        type: "SET_FILTERS",
        payload: newFilters,
      });
    }

    setShowFilters(false);
  };

  const handleClearFilters = () => {
    dispatchFilters({ type: "RESET_FILTERS" });
    resetFiltersUI();
    setProducts([]);
    setPage(1);
  };

  // ---- Infinite scroll ----
  const handleLoadMore = () => {
    if (!isFetching && hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  // ---- Pull to refresh ----
  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    // refreshing is set false in useEffect when fetch finishes
  };

  // ---- FAB animation ----
  const toggleMenu = () => {
    const toValue = showAddMenu ? 0 : 1;
    setShowAddMenu(!showAddMenu);

    RNAnimated.spring(rotateAnim, {
      toValue,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>UR SHOP</Text>
        </View>

        {/* Search + Filter row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchWrapper}>
            <TextInput
              value={searchInput}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Search Any Product..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
            {hasActiveQuery && (
              <Pressable
                style={styles.searchIconButton}
                onPress={handleClearAll}
              >
                <Feather name="x" size={18} color={colors.muted} />
              </Pressable>
            )}
            <Pressable
              style={styles.searchIconButton}
              onPress={handleSearchSubmit}
            >
              <Feather name="search" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.filterWrapper}>
            <Pressable
              style={[
                styles.filterButton,
                (showFilters || activeFilterCount > 0) &&
                  styles.filterButtonActive,
              ]}
              onPress={handleToggleFilters}
            >
              <Feather
                name="sliders"
                size={14}
                color={colors.text}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.filterButtonText}>Filters</Text>
            </Pressable>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Mode text */}
        <Text style={styles.modeText}>
          {isSearchMode
            ? "Search mode (filters disabled)"
            : activeFilterCount > 0
            ? `Filter mode active (${activeFilterCount})`
            : "All products"}
        </Text>

        {/* Initial loading */}
        {isInitialLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {/* Empty */}
        {!isInitialLoading && !isFetching && products.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        )}

        {/* List */}
        {products.length > 0 && (
          <>
            <FlashList
              data={products}
              keyExtractor={(item: any) => item._id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              refreshing={refreshing}
              onRefresh={onRefresh}
              renderItem={({ item, index }) => {
                const primaryVariant = item.variants?.[0];
                const stock = primaryVariant?.stock ?? 0;
                const firstTier = primaryVariant?.sellingPrices?.[0];
                const sellingPrice =
                  firstTier?.price ?? primaryVariant?.mrp ?? 0;

                const mrp = primaryVariant?.mrp ?? 0;
                const marginPercent =
                  mrp > 0
                    ? Math.round(
                        ((Number(mrp) - Number(sellingPrice)) / Number(mrp)) *
                          100
                      )
                    : null;

                const variantCount = Array.isArray(item.variants)
                  ? item.variants.length
                  : 0;

                const thumbUrl =
                  item.thumbnail?.secureUrl || item.thumbnail?.url || "";

                return (
                  <Pressable
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate("ProductDetail", {
                        productId: item._id,
                      })
                    }
                  >
                    <View style={styles.thumbnailWrapper}>
                      {thumbUrl ? (
                        <Image
                          source={{ uri: thumbUrl }}
                          style={styles.thumbnail}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.thumbnail,
                            styles.thumbnailPlaceholder,
                          ]}
                        >
                          <Text style={{ color: colors.textMuted }}>
                            No image
                          </Text>
                        </View>
                      )}

                      {variantCount > 1 && (
                        <View style={styles.variantFlag}>
                          <Text style={styles.variantFlagText}>
                            {variantCount} variants
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text numberOfLines={2} style={styles.name}>
                      {item.name}
                    </Text>

                    <View style={styles.cardPriceRow}>
                      <Text style={styles.price}>
                        ₹{Number(sellingPrice || 0).toFixed(2)}
                      </Text>
                      {marginPercent !== null && (
                        <Text style={styles.marginText}>
                          {marginPercent}% margin
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.stockChip,
                        stock > 2 ? styles.stockOk : styles.stockLow,
                      ]}
                    >
                      <Text style={styles.stockText}>
                        {stock > 2 ? "In stock " : "Low stock "}({stock})
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />

            {/* Load more spinner */}
            {isLoadingMore && (
              <View style={styles.loadMoreSpinner}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </>
        )}
      </View>

      {/* Floating + button like WhatsApp */}
      <Pressable style={styles.fab} onPress={toggleMenu}>
        <RNAnimated.View style={{ transform: [{ rotate: rotation }] }}>
          <Feather name="plus" size={24} color="#fff" />
        </RNAnimated.View>
      </Pressable>

      {/* Add Menu Modal - WhatsApp Style */}
      <Modal
        visible={showAddMenu}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={toggleMenu}>
          <View style={styles.menuContainer}>
            <Animated.View
              entering={SlideInDown.delay(150).springify()}
              exiting={FadeOut}
            >
              <Pressable
                style={styles.menuItemWhatsApp}
                onPress={() => {
                  toggleMenu();
                  setTimeout(() => navigation.navigate("ProductForm"), 200);
                }}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Feather name="package" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemWhatsAppText}>Add Product</Text>
              </Pressable>
            </Animated.View>
            <Animated.View
              entering={SlideInDown.delay(100).springify()}
              exiting={FadeOut}
            >
              <Pressable
                style={styles.menuItemWhatsApp}
                onPress={() => {
                  toggleMenu();
                  setTimeout(() => navigation.navigate("CategoryForm"), 200);
                }}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: "#8B5CF6" },
                  ]}
                >
                  <Feather name="folder" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemWhatsAppText}>Add Category</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={SlideInDown.delay(50).springify()}
              exiting={FadeOut}
            >
              <Pressable
                style={styles.menuItemWhatsApp}
                onPress={() => {
                  toggleMenu();
                  setTimeout(() => navigation.navigate("SubCategoryForm"), 200);
                }}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: "#10B981" },
                  ]}
                >
                  <Feather name="grid" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemWhatsAppText}>Add SubCategory</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={SlideInDown.delay(0).springify()}
              exiting={FadeOut}
            >
              <Pressable
                style={styles.menuItemWhatsApp}
                onPress={() => {
                  toggleMenu();
                  setTimeout(
                    () => navigation.navigate("SubSubCategoryForm"),
                    200
                  );
                }}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: "#F59E0B" },
                  ]}
                >
                  <Feather name="layers" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemWhatsAppText}>
                  Add Sub Sub Category
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      </Modal>

      {/* Filter Modal – stays above FAB */}
      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
        style={{ zIndex: 1, position: "absolute", top: 20 }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowFilters(false)}
        >
          <Pressable
            style={styles.filterPanel}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterHeaderTitle}>Filter Products</Text>
              <Pressable onPress={() => setShowFilters(false)}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.filterLabel}>Category</Text>
            <TextInput
              value={filterCategory}
              onChangeText={setFilterCategory}
              placeholder="beauty / cosmetics / general_store / gifts"
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />

            <Text style={styles.filterLabel}>Sub Category</Text>
            <TextInput
              value={filterSubCategory}
              onChangeText={setFilterSubCategory}
              placeholder="e.g. beauty_skincare"
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />

            <Text style={styles.filterLabel}>Sub-Sub Category</Text>
            <TextInput
              value={filterSubSubCategory}
              onChangeText={setFilterSubSubCategory}
              placeholder="e.g. face_wash, lipstick"
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />

            <Text style={styles.filterLabel}>Brand (comma separated)</Text>
            <TextInput
              value={filterBrand}
              onChangeText={setFilterBrand}
              placeholder="e.g. Dove,Lakme"
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />

            <Text style={styles.filterLabel}>Tags / Keywords</Text>
            <TextInput
              value={filterTags}
              onChangeText={setFilterTags}
              placeholder="e.g. skin,oil,fragrance"
              placeholderTextColor={colors.muted}
              style={styles.filterInput}
            />

            <View style={styles.priceRowFilters}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Min Price</Text>
                <TextInput
                  value={filterMinPrice}
                  onChangeText={setFilterMinPrice}
                  placeholder="e.g. 100"
                  keyboardType="numeric"
                  placeholderTextColor={colors.muted}
                  style={styles.filterInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Max Price</Text>
                <TextInput
                  value={filterMaxPrice}
                  onChangeText={setFilterMaxPrice}
                  placeholder="e.g. 500"
                  keyboardType="numeric"
                  placeholderTextColor={colors.muted}
                  style={styles.filterInput}
                />
              </View>
            </View>

            <Pressable
              style={[
                styles.inStockToggle,
                filterInStock && styles.inStockToggleActive,
              ]}
              onPress={() => setFilterInStock((prev) => !prev)}
            >
              <Text style={styles.inStockToggleText}>
                {filterInStock
                  ? "Only in-stock products"
                  : "Include out of stock"}
              </Text>
            </Pressable>

            <View style={styles.filterActions}>
              <Pressable
                style={styles.filterApplyBtn}
                onPress={handleApplyFilters}
              >
                <Text style={styles.filterApplyText}>Apply</Text>
              </Pressable>
              <Pressable
                style={styles.filterClearBtn}
                onPress={handleClearFilters}
              >
                <Text style={styles.filterClearText}>Clear</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.primary,
    backgroundColor: colors.bg,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgElevated,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xs,
    color: colors.text,
  },
  searchIconButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterWrapper: {
    position: "relative",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  filterButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  modeText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
    // padding: spacing.md,
  },
  filterPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.bgElevated,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  filterHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  filterInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.text,
    marginBottom: spacing.sm,
    fontSize: 13,
    backgroundColor: colors.bgElevated,
  },
  priceRowFilters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inStockToggle: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  inStockToggleActive: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderColor: colors.success,
  },
  inStockToggleText: {
    fontSize: 12,
    color: colors.text,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterApplyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  filterApplyText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  filterClearBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  filterClearText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    // paddingBottom: spacing.md + 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT - 5,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    // marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailWrapper: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: CARD_WIDTH,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
  },
  variantFlag: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  variantFlagText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: 13,
    color: colors.primary,
  },
  marginText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  stockChip: {
    marginTop: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  stockOk: {
    backgroundColor: "rgba(16,185,129,0.12)",
  },
  stockLow: {
    backgroundColor: "rgba(239,68,68,0.14)",
  },
  stockText: {
    fontSize: 11,
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
  loadMoreSpinner: {
    paddingVertical: spacing.sm,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menuContainer: {
    position: "absolute",
    bottom: 180,
    right: 24,
    gap: 12,
  },
  menuItemWhatsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItemWhatsAppText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
