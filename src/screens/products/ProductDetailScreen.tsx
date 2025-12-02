import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { ProductsStackParamList } from '@/navigation/ProductsNavigator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Image } from 'expo-image';
import { useGetProductDetail } from '@/api/hooks/useAdmin';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const H_PADDING = spacing.md * 2;
const CAROUSEL_WIDTH = width - H_PADDING;
const CAROUSEL_HEIGHT = 260;

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { data, isLoading, isError } = useGetProductDetail(productId);
  const product = data as any;

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    return product.variants[selectedVariantIndex] ?? product.variants[0];
  }, [product, selectedVariantIndex]);

  const imagesForCarousel: string[] = useMemo(() => {
    if (!product) return [];
    const variantImages = selectedVariant?.images ?? [];

    const urls = variantImages.length
      ? variantImages
          .map((img: any) => img?.secureUrl || img?.url)
          .filter(Boolean)
      : [];

    const thumbUrl = product.thumbnail?.secureUrl || product.thumbnail?.url;

    if (!urls.length) {
      return thumbUrl ? [thumbUrl] : [];
    }

    if (thumbUrl && !urls.includes(thumbUrl)) {
      return [thumbUrl, ...urls];
    }

    return urls;
  }, [product, selectedVariant]);

  const {
    mrp,
    sellingPrice,
    marginPercent,
    stock,
    variantLabel,
    firstTier,
  } = useMemo(() => {
    if (!selectedVariant) {
      return {
        mrp: 0,
        sellingPrice: 0,
        marginPercent: null as number | null,
        stock: 0,
        variantLabel: '',
        firstTier: undefined as any,
      };
    }

    const v = selectedVariant;
    const ft = Array.isArray(v.sellingPrices) ? v.sellingPrices[0] : undefined;

    const vMrp = Number(v.mrp || 0);
    const vSelling = Number(ft?.price ?? v.mrp ?? 0);

    const margin =
      vMrp > 0 ? Math.round(((vMrp - vSelling) / vMrp) * 100) : null;

    const label =
      v.measurement?.label ||
      (v.measurement?.value && v.measurement?.unit
        ? `${v.measurement.value} ${v.measurement.unit}`
        : `Pack of ${v.packOf}`);

    return {
      mrp: vMrp,
      sellingPrice: vSelling,
      marginPercent: margin,
      stock: Number(v.stock ?? 0),
      variantLabel: label,
      firstTier: ft,
    };
  }, [selectedVariant]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    setImageIndex(index);
  };

  const handleVariantSelect = (index: number) => {
    setSelectedVariantIndex(index);
    setImageIndex(0);
  };

  const categoryPath = useMemo(() => {
    if (!product) return '';
    const pieces = [product.category, product.subCategory, product.subSubCategory].filter(
      Boolean,
    );
    return pieces.join(' / ');
  }, [product]);

  const createdAt = product?.createdAt ? new Date(product.createdAt) : null;
  const updatedAt = product?.updatedAt ? new Date(product.updatedAt) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={18} color={colors.tint} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Product Detail</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <View style={styles.center}>
            <Text style={styles.text}>Failed to load product.</Text>
          </View>
        )}

        {/* Not found */}
        {!isLoading && !product && !isError && (
          <View style={styles.center}>
            <Text style={styles.text}>Product not found.</Text>
          </View>
        )}

        {/* Content */}
        {product && (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image carousel */}
              <View style={styles.carouselWrapper}>
                {imagesForCarousel.length > 0 ? (
                  <>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                    >
                      {imagesForCarousel.map((uri, idx) => (
                        <View key={`${uri}-${idx}`} style={styles.carouselItem}>
                          <Image
                            source={{ uri }}
                            style={styles.carouselImage}
                            contentFit="contain"
                          />
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.dotsRow}>
                      {imagesForCarousel.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.dot,
                            idx === imageIndex && styles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.carouselPlaceholder}>
                    <Text style={{ color: colors.muted }}>No image</Text>
                  </View>
                )}
              </View>

              {/* Brand + Name */}
              <View style={styles.titleBlock}>
                <Text style={styles.brandText}>
                  {product.brand || 'Unknown brand'}
                </Text>
                <Text style={styles.title}>{product.name}</Text>
              </View>

              {/* Price strip: MRP, Selling, Margin | Stock */}
              <View style={styles.priceStrip}>
                <View style={styles.priceStripLeft}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceItemLabel}>MRP</Text>
                    <Text style={styles.priceItemValueMrp}>
                      ₹{mrp.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceItemLabel}>Selling</Text>
                    <Text style={styles.priceItemValue}>
                      ₹{sellingPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceItemLabel}>Margin</Text>
                    <Text style={styles.priceItemValueMargin}>
                      {marginPercent !== null ? `${marginPercent}%` : '-'}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceStripRight}>
                  <Text style={styles.priceItemLabel}>Stock</Text>
                  <Text style={styles.priceItemValue}>{stock}</Text>
                </View>
              </View>

              {/* Variant selector */}
              {Array.isArray(product.variants) && product.variants.length > 0 && (
                <View style={styles.variantCard}>
                  <Text style={styles.sectionHeading}>Variants</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.variantsRow}
                  >
                    {product.variants.map((v: any, idx: number) => {
                      const label =
                        v.measurement?.label ||
                        (v.measurement?.value && v.measurement?.unit
                          ? `${v.measurement.value} ${v.measurement.unit}`
                          : `Pack of ${v.packOf}`);

                      const isActive = idx === selectedVariantIndex;

                      return (
                        <Pressable
                          key={v._id || idx}
                          style={[
                            styles.variantChip,
                            isActive && styles.variantChipActive,
                          ]}
                          onPress={() => handleVariantSelect(idx)}
                        >
                          <Text
                            style={[
                              styles.variantChipText,
                              isActive && styles.variantChipTextActive,
                            ]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.variantInfoRow}>
                    <Feather name="info" size={14} color={colors.muted} />
                    <Text style={styles.variantInfoText}>
                      Selected: {variantLabel} • Stock {stock}
                    </Text>
                  </View>
                </View>
              )}

              {/* Quantity-based discounts section */}
              {selectedVariant &&
                Array.isArray(selectedVariant.sellingPrices) &&
                selectedVariant.sellingPrices.length > 0 && (
                  <View style={styles.discountCard}>
                    <Text style={styles.sectionHeading}>
                      Quantity based pricing
                    </Text>

                    <View style={styles.discountHeaderRow}>
                      <Text
                        style={[styles.discountHeaderCell, styles.discountQtyCol]}
                      >
                        Min Qty
                      </Text>
                      <Text
                        style={[
                          styles.discountHeaderCell,
                          styles.discountPriceCol,
                        ]}
                      >
                        Price
                      </Text>
                      <Text
                        style={[
                          styles.discountHeaderCell,
                          styles.discountDiscCol,
                        ]}
                      >
                        Discount
                      </Text>
                    </View>

                    {selectedVariant.sellingPrices.map(
                      (tier: any, idx: number) => (
                        <View key={idx} style={styles.discountRow}>
                          <Text
                            style={[styles.discountCell, styles.discountQtyCol]}
                          >
                            {tier.minQuantity}
                          </Text>
                          <Text
                            style={[
                              styles.discountCell,
                              styles.discountPriceCol,
                            ]}
                          >
                            ₹{Number(tier.price).toFixed(2)}
                          </Text>
                          <Text
                            style={[
                              styles.discountCell,
                              styles.discountDiscCol,
                            ]}
                          >
                            {tier.discount}%
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                )}

              {/* Details section */}
              <View style={styles.detailsCard}>
                <Text style={styles.sectionHeading}>Details</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Slug</Text>
                  <Text style={styles.detailValue}>{product.slug}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand</Text>
                  <Text style={styles.detailValue}>{product.brand}</Text>
                </View>

                {categoryPath ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{categoryPath}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Variants</Text>
                  <Text style={styles.detailValue}>
                    {Array.isArray(product.variants)
                      ? product.variants.length
                      : 0}
                  </Text>
                </View>

                {selectedVariant && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Selected Variant</Text>
                      <Text style={styles.detailValue}>{variantLabel}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pack Of</Text>
                      <Text style={styles.detailValue}>
                        {selectedVariant.packOf}
                      </Text>
                    </View>

                    {firstTier && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Min Qty (Tier 1)
                          </Text>
                          <Text style={styles.detailValue}>
                            {firstTier.minQuantity}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Discount (Tier 1)
                          </Text>
                          <Text style={styles.detailValue}>
                            {firstTier.discount}%
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {product.tags && product.tags.length > 0 && (
                  <View style={styles.detailRowColumn}>
                    <Text style={styles.detailLabel}>Tags</Text>
                    <Text style={styles.detailValue}>
                      {product.tags.join(', ')}
                    </Text>
                  </View>
                )}

                {product.description ? (
                  <View style={styles.detailRowColumn}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{product.description}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRowColumn}>
                  <Text style={styles.detailLabel}>Delivery Options</Text>
                  <View style={styles.deliveryRow}>
                    <DetailPill
                      label="Cancelable"
                      active={!!product.deliveryOption?.isCancel}
                    />
                    <DetailPill
                      label="Returnable"
                      active={!!product.deliveryOption?.isReturnable}
                    />
                    <DetailPill
                      label="Warranty"
                      active={!!product.deliveryOption?.isWarranty}
                    />
                  </View>
                </View>

                {(createdAt || updatedAt) && (
                  <View style={styles.detailRowColumn}>
                    <Text style={styles.detailLabel}>Timestamps</Text>
                    {createdAt && (
                      <Text style={styles.detailValue}>
                        Created: {createdAt.toLocaleString()}
                      </Text>
                    )}
                    {updatedAt && (
                      <Text style={styles.detailValue}>
                        Updated: {updatedAt.toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.bottomBar}>
              <Pressable
                style={styles.bottomBtn}
                onPress={() => {
                  console.log('Edit pressed');
                }}
              >
                <Feather name="edit-3" size={16} color={colors.text} />
                <Text style={styles.bottomBtnText}>Edit</Text>
              </Pressable>

              <Pressable
                style={[styles.bottomBtn, styles.bottomBtnPrimary]}
                onPress={() => {
                  console.log('Stock+ pressed');
                }}
              >
                <Feather name="plus-square" size={16} color="#fff" />
                <Text
                  style={[styles.bottomBtnText, styles.bottomBtnTextPrimary]}
                >
                  Stock +
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
};

const DetailPill: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => {
  return (
    <View
      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    >
      <Text
        style={[
          styles.pillText,
          active ? styles.pillTextActive : styles.pillTextInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: colors.tint,
    fontSize: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },

  // Carousel
  carouselWrapper: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT + 50,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#ffffffff',
    marginBottom: spacing.md,
  },
  carouselItem: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT + 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: CAROUSEL_WIDTH + 60,
    height: CAROUSEL_HEIGHT + 60,
  },
  carouselPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(148,163,184,0.7)',
  },
  dotActive: {
    width: 10,
    backgroundColor: '#f97316',
  },

  // Title block
  titleBlock: {
    marginBottom: spacing.md,
  },
  brandText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  // Price strip
  priceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  priceStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 16,
  },
  priceStripRight: {
    alignItems: 'flex-end',
  },
  priceItem: {
    flexDirection: 'column',
  },
  priceItemLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2,
  },
  priceItemValueMrp: {
    fontSize: 13,
    color: colors.text,
    textDecorationLine: 'line-through',
  },
  priceItemValue: {
    fontSize: 14,
    color: colors.header,
    fontWeight: '600',
  },
  priceItemValueMargin: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },

  // Variants
  variantCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  variantsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  variantChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  variantChipActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#e0f2fe',
  },
  variantChipText: {
    fontSize: 12,
    color: '#64748b',
  },
  variantChipTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  variantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  variantInfoText: {
    fontSize: 12,
    color: colors.muted,
  },

  // Quantity-based discounts
  discountCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  discountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    marginBottom: 4,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  discountHeaderCell: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  discountCell: {
    fontSize: 12,
    color: colors.text,
  },
  discountQtyCol: {
    flex: 1,
  },
  discountPriceCol: {
    flex: 1,
    textAlign: 'center',
  },
  discountDiscCol: {
    flex: 1,
    textAlign: 'right',
  },

  // Details
  detailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 6,
  },
  detailRowColumn: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    flexShrink: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#ecfdf3',
    borderColor: '#16a34a',
  },
  pillInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  pillText: {
    fontSize: 11,
  },
  pillTextActive: {
    color: '#15803d',
    fontWeight: '600',
  },
  pillTextInactive: {
    color: '#64748b',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: "transparent",
    // borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  bottomBtnPrimary: {
    backgroundColor: colors.header,
    borderColor: colors.header,
  },
  bottomBtnText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  bottomBtnTextPrimary: {
    color: '#fff',
  },
});
