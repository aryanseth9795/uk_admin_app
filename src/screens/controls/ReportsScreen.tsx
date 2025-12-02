// src/screens/ReportScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { useReport } from '../../api/hooks/useControls';

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

  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
};

const getDateLabel = (range: DateRangeKey) => {
  const entry = dateRangeFilters.find((d) => d.key === range);
  return entry?.label ?? 'Recent';
};

const ReportScreen: React.FC = () => {
  const [range, setRange] = useState<DateRangeKey>('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { from, to } = getDateRange(range);

  const { data, isLoading, refetch } = useReport({ from, to });

  const statsArray = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'revenue',
        label: 'Revenue',
        value: data.revenue,
        formatted: `₹${data.revenue.toLocaleString('en-IN')}`,
        color: '#22c55e',
      },
      {
        key: 'totalOrders',
        label: 'No. of Orders',
        value: data.totalOrders,
        formatted: data.totalOrders.toLocaleString('en-IN'),
        color: '#3b82f6',
      },
      {
        key: 'totalProductSales',
        label: 'No. of Product Sales',
        value: data.totalProductSales,
        formatted: data.totalProductSales.toLocaleString('en-IN'),
        color: '#f97316',
      },
      {
        key: 'totalUsersOrdered',
        label: 'Users Ordered',
        value: data.totalUsersOrdered,
        formatted: data.totalUsersOrdered.toLocaleString('en-IN'),
        color: '#a855f7',
      },
      {
        key: 'totalUsersRegistered',
        label: 'Users Registered',
        value: data.totalUsersRegistered,
        formatted: data.totalUsersRegistered.toLocaleString('en-IN'),
        color: '#eab308',
      },
    ];
  }, [data]);

  const maxValue =
    statsArray.length > 0
      ? Math.max(...statsArray.map((s) => (s.value > 0 ? s.value : 0)), 1)
      : 1;

  const dateSummary = getDateLabel(range);

  const handleResetFilters = () => {
    setRange('recent');
    refetch();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Reports</Text>
        </View>

        {/* Collapsible filter card with ONLY date filter */}
        <Animated.View layout={Layout.springify()}>
          <View style={styles.filterCard}>
            <Pressable
              style={styles.filterHeader}
              onPress={() => setFiltersOpen((prev) => !prev)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.filterTitle}>Filters</Text>
                <Text style={styles.filterSubtitle}>{dateSummary}</Text>
              </View>
              <Text style={styles.chevron}>{filtersOpen ? '▲' : '▼'}</Text>
            </Pressable>

            {filtersOpen && (
              <Animated.View layout={Layout.springify()}>
                <View style={styles.filterTopRow}>
                  <Pressable onPress={handleResetFilters}>
                    <Text style={styles.resetText}>Reset</Text>
                  </Pressable>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Date Range</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow as any}
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
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {!isLoading && !data && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No report data.</Text>
          </View>
        )}

        {!isLoading && data && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {statsArray.map((stat) => {
              const percent = stat.value > 0 ? (stat.value / maxValue) * 100 : 0;
              return (
                <View key={stat.key} style={styles.statCard}>
                  <View style={styles.statHeaderRow}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.formatted}</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${percent}%`,
                          backgroundColor: stat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.statHint}>
                    {percent.toFixed(0)}% of max in this view
                  </Text>
                </View>
              );
            })}
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },

  filterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  filterHeader: {
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
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.muted,
  },
  filterTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  resetText: {
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
  chipRow: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  barBackground: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.chipBg,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  statHint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.muted,
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

export default ReportScreen;
