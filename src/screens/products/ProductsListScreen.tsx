import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ProductsStackParamList } from '@/navigation/ProductsNavigator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Image } from 'expo-image';
import { useGetAdminProductList } from '@/api/hooks/useAdmin';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;
const CARD_HEIGHT = CARD_WIDTH + 120; // fixed height so all cards same

export const ProductsListScreen: React.FC<Props> = ({ navigation }) => {
  // search: input vs applied (to API)
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // applied filters (used in API)
  const [category, setCategory] = useState<string | undefined>();
  const [subCategory, setSubCategory] = useState<string | undefined>();
  const [subSubCategory, setSubSubCategory] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [tags, setTags] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<string | undefined>();
  const [maxPrice, setMaxPrice] = useState<string | undefined>();
  const [inStock, setInStock] = useState<string | undefined>(); // 'true'

  const [page, setPage] = useState(1);

  // filter panel UI state (draft)
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterSubSubCategory, setFilterSubSubCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);

  // aggregated list for infinite scroll
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // SEARCH MODE: search OR filters
  const isSearchMode = search.trim().length > 0;

  const { data, isLoading, isFetching,refetch } = useGetAdminProductList({
    page,
    search: isSearchMode ? search.trim() : undefined,
    category: isSearchMode ? undefined : category,
    subCategory: isSearchMode ? undefined : subCategory,
    subSubCategory: isSearchMode ? undefined : subSubCategory,
    brand: isSearchMode ? undefined : brand,
    tags: isSearchMode ? undefined : tags,
    minPrice: isSearchMode ? undefined : minPrice,
    maxPrice: isSearchMode ? undefined : maxPrice,
    inStock: isSearchMode ? undefined : inStock,
  });

  const serverProducts = data?.products ?? [];
  const hasNextPage = data?.hasNextPage ?? false;

  const activeFilterCount = [
    category,
    subCategory,
    subSubCategory,
    brand,
    tags,
    minPrice,
    maxPrice,
    inStock === 'true' ? 'inStock' : null,
  ].filter(Boolean).length;

  const isInitialLoading =
    (isLoading || (isFetching && page === 1)) && products.length === 0;

  const isLoadingMore = isFetching && page > 1;

  // sync aggregated products when data changes
  useEffect(() => {
    if (!data) return;

    if (page === 1) {
      setProducts(serverProducts);
    } else {
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newOnes = serverProducts.filter(
          (p) => !existingIds.has(p._id)
        );
        return [...prev, ...newOnes];
      });
    }
  }, [serverProducts, page, data]);

  // stop refreshing when new data has finished fetching
  useEffect(() => {
    if (!isFetching && refreshing) {
      setRefreshing(false);
    }
  }, [isFetching, refreshing]);

  // ---- helpers to reset ----
  const resetFiltersApplied = () => {
    setCategory(undefined);
    setSubCategory(undefined);
    setSubSubCategory(undefined);
    setBrand(undefined);
    setTags(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStock(undefined);
  };

  const resetFiltersUI = () => {
    setFilterCategory('');
    setFilterSubCategory('');
    setFilterSubSubCategory('');
    setFilterBrand('');
    setFilterTags('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterInStock(false);
  };

  const resetAllQueryState = () => {
    setSearch('');
    setSearchInput('');
    resetFiltersApplied();
    resetFiltersUI();
    setPage(1);
    setProducts([]);
    setShowFilters(false);
  };

  // ---- Search handlers ----

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
  };

  const applySearch = () => {
    const value = searchInput.trim();

    setProducts([]);
    setPage(1);

    if (value.length > 0) {
      // search mode → clear filters
      resetFiltersApplied();
      resetFiltersUI();
      setShowFilters(false);
    }

    setSearch(value);
  };

  const handleSearchSubmit = () => {
    applySearch();
  };

  // when search or filters are active, show cross icon
  const hasActiveQuery = search.trim().length > 0 || activeFilterCount > 0;

  const handleClearAll = () => {
    resetAllQueryState();
  };

  // ---- Filter handlers ----

  const handleToggleFilters = () => {
    // opening filters clears search (search OR filters)
    setSearch('');
    setSearchInput('');

    setShowFilters((prev) => !prev);

    // init draft values from applied filters
    setFilterCategory(category ?? '');
    setFilterSubCategory(subCategory ?? '');
    setFilterSubSubCategory(subSubCategory ?? '');
    setFilterBrand(brand ?? '');
    setFilterTags(tags ?? '');
    setFilterMinPrice(minPrice ?? '');
    setFilterMaxPrice(maxPrice ?? '');
    setFilterInStock(inStock === 'true');
  };

  const handleApplyFilters = () => {
    setProducts([]);
    setPage(1);

    setCategory(filterCategory.trim() || undefined);
    setSubCategory(filterSubCategory.trim() || undefined);
    setSubSubCategory(filterSubSubCategory.trim() || undefined);
    setBrand(filterBrand.trim() || undefined);
    setTags(filterTags.trim() || undefined);
    setMinPrice(filterMinPrice.trim() || undefined);
    setMaxPrice(filterMaxPrice.trim() || undefined);
    setInStock(filterInStock ? 'true' : undefined);

    setShowFilters(false);
  };

  const handleClearFilters = () => {
    resetFiltersApplied();
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
    // resetAllQueryState(); 
    refetch();
    setRefreshing(false)
    // // React Query refetches automatically when key changes
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Products</Text>
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
            <Pressable
              style={styles.searchIconButton}
              onPress={hasActiveQuery ? handleClearAll : handleSearchSubmit}
            >
              <Feather
                name={hasActiveQuery ? 'x' : 'search'}
                size={18}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <View style={styles.filterWrapper}>
            <Pressable
              style={[
                styles.filterButton,
                showFilters && styles.filterButtonActive,
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
              <View  style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mode text */}
        <Text style={styles.modeText}>
          {isSearchMode
            ? 'Search mode (filters disabled)'
            : activeFilterCount > 0
            ? `Filter mode active (${activeFilterCount})`
            : 'All products'}
        </Text>

        {/* Filter panel */}
        {showFilters && (
          <Animated.View
            entering={FadeInUp}
            layout={Layout.springify()}
            style={styles.filterPanel}
          >
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
                {filterInStock ? 'Only in-stock products' : 'Include out of stock'}
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
          </Animated.View>
        )}

        {/* Initial loading */}
        {isInitialLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
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
                        ((Number(mrp) - Number(sellingPrice)) /
                          Number(mrp)) * 100
                      )
                    : null;

                const variantCount = Array.isArray(item.variants)
                  ? item.variants.length
                  : 0;

                const thumbUrl =
                  item.thumbnail?.secureUrl || item.thumbnail?.url || '';

                return (
                  <Animated.View
                    style={{ flex: 1 }}
                    entering={FadeInUp.delay(index * 40)}
                    exiting={FadeOut}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      style={styles.card}
                      onPress={() =>
                        navigation.navigate('ProductDetail', {
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
                            <Text style={{ color: colors.muted }}>
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
                          {stock > 2 ? 'In stock ' : 'Low stock '}(
                          {stock})
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />

            {/* Load more spinner */}
            {isLoadingMore && (
              <View style={styles.loadMoreSpinner}>
                <ActivityIndicator color={colors.tint} />
              </View>
            )}
          </>
        )}
      </View>

      {/* Floating + button like WhatsApp */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
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
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterButtonActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modeText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  filterPanel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
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
  },
  priceRowFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inStockToggle: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inStockToggleActive: {
    backgroundColor: '#ecfdf3',
    borderColor: '#16a34a',
  },
  inStockToggleText: {
    fontSize: 12,
    color: colors.text,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterApplyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.header,
  },
  filterApplyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  filterClearBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterClearText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: spacing.lg + 60, // extra space for FAB
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  variantFlag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#f97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  variantFlagText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: 13,
    color: colors.header,
  },
  marginText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  stockChip: {
    marginTop: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stockOk: {
    backgroundColor: '#E8F8F2',
  },
  stockLow: {
    backgroundColor: '#FDEDEC',
  },
  stockText: {
    fontSize: 11,
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
  loadMoreSpinner: {
    paddingVertical: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.header,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
