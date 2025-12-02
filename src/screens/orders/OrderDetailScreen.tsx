import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { OrdersStackParamList } from '@/navigation/OrdersNavigator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { useOrderDetail } from '@/api/hooks/useOrders';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC<Props> = ({ route }) => {
  const { orderId } = route.params;
  const { data: order, isLoading, refetch } = useOrderDetail(orderId);

  const imageUrl = (thumb?: { secureUrl?: string; url?: string }) =>
    thumb?.secureUrl || thumb?.url || undefined;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Order Details</Text>
          <Text style={styles.orderId}>#{orderId.slice(0, 8)}...</Text>
        </View>

        {isLoading && !order && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {!isLoading && !order && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Order not found.</Text>
          </View>
        )}

        {order && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={[colors.tint]}
              />
            }
          >
            {/* Customer + Summary */}
            <Animated.View layout={Layout.springify()} entering={FadeInUp.delay(50)}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{order.name}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Mobile</Text>
                    <Text style={styles.value}>{order.mobilenumber}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.label}>Total Amount</Text>
                    <Text style={styles.valueAccent}>
                      ₹{order.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.label}>No. of Products</Text>
                    <Text style={styles.value}>{order.noOfProducts}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Address */}
            <Animated.View
              layout={Layout.springify()}
              entering={FadeInUp.delay(120)}
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.label}>{order.address.label}</Text>
                <Text style={styles.addressLine}>
                  {order.address.Receiver_Name}
                </Text>
                <Text style={styles.addressLine}>
                  {order.address.Address_Line1}
                </Text>
                {order.address.Address_Line2 ? (
                  <Text style={styles.addressLine}>
                    {order.address.Address_Line2}
                  </Text>
                ) : null}
                <Text style={styles.addressLine}>
                  {order.address.City} - {order.address.pincode}
                </Text>
                <Text style={styles.addressPhone}>
                  📞 {order.address.Receiver_MobileNumber}
                </Text>
              </View>
            </Animated.View>

            {/* Items */}
            <Animated.View
              layout={Layout.springify()}
              entering={FadeInUp.delay(200)}
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Items ({order.products.length})
                </Text>

                {order.products.map((item, index) => {
                  const uri = imageUrl(item.thumbnail);
                  return (
                    <View key={item._id + index} style={styles.itemRow}>
                      <View style={styles.thumbWrapper}>
                        {uri ? (
                          <Image
                            source={{ uri }}
                            style={styles.thumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.thumbPlaceholder}>
                            <Text style={styles.thumbPlaceholderText}>
                              {item.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemSub}>
                          Variant: {item.variantId.toString().slice(0, 6)}...
                        </Text>
                      </View>

                      <View style={styles.itemQtyBox}>
                        <Text style={styles.itemQtyLabel}>Qty</Text>
                        <Text style={styles.itemQtyValue}>{item.quantity}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  orderId: {
    fontSize: 12,
    color: colors.muted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.header,
    marginBottom: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  } as any,
  label: {
    fontSize: 11,
    color: colors.muted,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  valueAccent: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.header,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  addressLine: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  thumbWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: colors.chipBg,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.header,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  itemSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  itemQtyBox: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  itemQtyLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  itemQtyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.header,
    marginTop: 2,
  },

  center: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
});

export default OrderDetailScreen;
