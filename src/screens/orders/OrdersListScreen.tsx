// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { FlashList } from '@shopify/flash-list';
// import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
// import { OrdersStackParamList } from '@/navigation/OrdersNavigator';
// import { useOrders, OrderStatus } from '@/api/hooks/useOrders';
// import { colors } from '@/theme/colors';
// import { spacing } from '@/theme/theme';
// import { ScreenContainer } from '@/components/ui/ScreenContainer';

// type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

// const statusFilters: (OrderStatus | 'all')[] = [
//   'all',
//   'new_unprocessed',
//   'processed',
//   'packed',
//   'shipped',
//   'out_for_delivery',
//   'delivered',
// ];

// const rangeFilters = ['today', 'yesterday', 'last_3_days', 'last_7_days'];

// export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
//   const [status, setStatus] = useState<(typeof statusFilters)[number]>('all');
//   const [range, setRange] = useState<string>('today');

//   const { data: orders, isLoading, refetch } = useOrders({ status, range });

//   return (
//     <ScreenContainer>
//       <View style={styles.container}>
//         <View style={styles.headerRow}>
//           <Text style={styles.heading}>Orders</Text>
//         </View>

//         <View style={styles.filterRow}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filterScrollContent}
//           >
//             {statusFilters.map((s) => (
//               <Pressable
//                 key={s}
//                 onPress={() => setStatus(s)}
//                 style={[styles.chip, status === s && styles.chipActive]}
//               >
//                 <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
//                   {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
//                 </Text>
//               </Pressable>
//             ))}
//           </ScrollView>
//         </View>

//         <View style={styles.filterRow}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filterScrollContent}
//           >
//             {rangeFilters.map((r) => (
//               <Pressable
//                 key={r}
//                 onPress={() => setRange(r)}
//                 style={[styles.chip, range === r && styles.chipActive]}
//               >
//                 <Text style={[styles.chipText, range === r && styles.chipTextActive]}>
//                   {r.replace(/_/g, ' ')}
//                 </Text>
//               </Pressable>
//             ))}
//           </ScrollView>
//         </View>

//         {isLoading && (
//           <View style={styles.center}>
//             <ActivityIndicator color={colors.tint} />
//           </View>
//         )}

//         {!isLoading && (!orders || orders.length === 0) && (
//           <View style={styles.center}>
//             <Text style={styles.emptyText}>No orders for this filter.</Text>
//           </View>
//         )}

//         {!!orders && orders.length > 0 && (
//           <FlashList
//             data={orders}
//             keyExtractor={(item) => item.id}
//             estimatedItemSize={80}
//             refreshing={isLoading}
//             onRefresh={refetch}
//             contentContainerStyle={styles.listContent}
//             renderItem={({ item, index }) => (
//               <Animated.View
//                 entering={FadeInUp.delay(index * 40)}
//                 exiting={FadeOut}
//                 layout={Layout.springify()}
//               >
//                 <Pressable
//                   onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
//                   style={styles.card}
//                 >
//                   <Text style={styles.cardTitle}>#{item.orderId}</Text>
//                   <Text style={styles.cardSubtitle}>₹{item.totalAmount.toFixed(2)}</Text>
//                   <Text style={styles.status}>{item.currentStatus.replace(/_/g, ' ').toUpperCase()}</Text>
//                 </Pressable>
//               </Animated.View>
//             )}
//           />
//         )}
//       </View>
//     </ScreenContainer>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: spacing.md },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//     marginTop:spacing.md
//   },
//   heading: {
//     fontSize: 30,
//     fontWeight: '700',
//     color: colors.text,

//   },
//   filterRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: spacing.sm,
//   } as any,
//   chip: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: colors.chipBorder,
//     backgroundColor: colors.chipBg,
//   },
//   chipActive: {
//     backgroundColor: colors.tint,
//     borderColor: colors.tint,
//   },
//   chipText: {
//     fontSize: 12,
//     color: colors.muted,
//   },
//   chipTextActive: {
//     color: '#020617',
//     fontWeight: '600',
//   },
//   listContent: {
//     paddingTop: spacing.md,
//     paddingBottom: spacing.lg,
//   },
//   card: {
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     padding: spacing.md,
//     marginBottom: spacing.sm,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
//   cardSubtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
//   status: { marginTop: 6, fontSize: 12, fontWeight: '500', color: colors.header },
//   center: {
//     paddingVertical: spacing.lg,
//     alignItems: 'center',
//   },
//   emptyText: {
//     color: colors.muted,
//     fontSize: 13,
//   },
// });

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { OrdersStackParamList } from '@/navigation/OrdersNavigator';
import { useOrders, OrderStatus } from '@/api/hooks/useOrders';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

const statusFilters: (OrderStatus | 'all')[] = [
  'all',
  'new_unprocessed',
  'processed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

type DateRangeKey = 'recent' | 'today' | 'yesterday' | 'last_3_days' | 'last_7_days';

const dateRangeFilters: { key: DateRangeKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_3_days', label: 'Last 3 days' },
  { key: 'last_7_days', label: 'Last 7 days' },
];

const getDateRange = (range: DateRangeKey): { from?: string; to?: string } => {
  if (range === 'recent') return {};

  const now = new Date();
  const end = new Date(now);

  if (range === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (range === 'yesterday') {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const yEnd = new Date();
    yEnd.setDate(yEnd.getDate() - 1);
    yEnd.setHours(23, 59, 59, 999);

    return { from: start.toISOString(), to: yEnd.toISOString() };
  }

  if (range === 'last_3_days') {
    const start = new Date();
    start.setDate(start.getDate() - 3);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  // last_7_days
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
};

const getStatusBadgeColors = (status: string) => {
  switch (status) {
    case 'delivered':
      return { bg: '#dcfce7', text: '#166534' }; // green
    case 'shipped':
    case 'out_for_delivery':
      return { bg: '#dbeafe', text: '#1d4ed8' }; // blue
    case 'packed':
    case 'processed':
      return { bg: '#fef9c3', text: '#854d0e' }; // amber
    case 'new_unprocessed':
    default:
      return { bg: '#fee2e2', text: '#991b1b' }; // red
  }
};

const getStatusLabel = (status: OrderStatus | 'all') => {
  if (status === 'all') return 'All statuses';
  return status?.replace(/_/g, ' ');
};

const getDateLabel = (range: DateRangeKey) => {
  const entry = dateRangeFilters.find((d) => d.key === range);
  return entry?.label ?? 'Recent';
};

export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('all');
  const [range, setRange] = useState<DateRangeKey>('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { from, to } = getDateRange(range);

  const { data: orders, isLoading, refetch } = useOrders({ status, from, to });

  // console.log(orders)
  const handleResetFilters = () => {
    setStatus('all');
    setRange('recent');
  };

  const statusSummary = getStatusLabel(status);
  const dateSummary = getDateLabel(range);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Orders</Text>
        </View>

        {/* Collapsible Filter Panel */}
        <Animated.View layout={Layout.springify()}>
          <View style={styles.filterCard}>
            <Pressable
              style={styles.filterCardHeader}
              onPress={() => setFiltersOpen((prev) => !prev)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.filterTitle}>Filters</Text>
                <Text style={styles.filterSubtitle}>
                  {statusSummary} · {dateSummary}
                </Text>
              </View>
              <Text style={styles.chevron}>{filtersOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {filtersOpen && (
              <>
                <View style={styles.filterHeaderRow}>
                  <Pressable onPress={handleResetFilters}>
                    <Text style={styles.clearText}>Reset</Text>
                  </Pressable>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent as any}
                  >
                    {statusFilters.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setStatus(s)}
                        style={[
                          styles.chip,
                          status === s && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            status === s && styles.chipTextActive,
                          ]}
                        >
                          {s === 'all' ? 'All' : s?.replace(/_/g, ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.divider} />

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Date</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent as any}
                  >
                    {dateRangeFilters.map((r) => (
                      <Pressable
                        key={r.key}
                        onPress={() => setRange(r.key)}
                        style={[
                          styles.chip,
                          range === r.key && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            range === r.key && styles.chipTextActive,
                          ]}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No orders for this filter.</Text>
          </View>
        )}

        {!!orders && orders.length > 0 && (
          <FlashList
            data={orders}
            keyExtractor={(item) => item._id}
            // estimatedItemSize={100}
            refreshing={isLoading}
            onRefresh={refetch}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const statusLabel = item.status
                ?.replace(/_/g, ' ')
                .toUpperCase();
              const badge = getStatusBadgeColors(item.status);

              return (
                <Animated.View
                  entering={FadeInUp.delay(index * 40)}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate('OrderDetail', {
                        orderId: item._id,
                      })
                    }
                    style={styles.card}
                  >
                    <View style={styles.cardTopRow}>
                      <View>
                        <Text style={styles.cardLabel}>Order ID</Text>
                        <Text style={styles.cardTitle}>#{item?._id}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: badge.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: badge.text },
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBottomRow}>
                      <View>
                        <Text style={styles.cardLabel}>Value</Text>
                        <Text style={styles.cardValue}>
                          ₹{item.totalAmount.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.cardChevron}>›</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            }}
          />
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },

  // Filter panel
  filterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  filterSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  clearText: {
    fontSize: 11,
    color: colors.tint,
    fontWeight: '500',
  },
  filterSection: {
    marginTop: spacing.sm,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  filterScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipBg,
  },
  chipActive: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
  chipText: {
    fontSize: 12,
    color: colors.muted,
  },
  chipTextActive: {
    color: '#020617',
    fontWeight: '600',
  },

  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as any,
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  } as any,
  cardLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.header,
    marginTop: 2,
  },
  cardChevron: {
    fontSize: 20,
    color: colors.muted,
  },

  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
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
