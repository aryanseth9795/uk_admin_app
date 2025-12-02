import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ControlsStackParamList } from '@/navigation/ControlsNavigator';
import { useStockSummary } from '@/api/hooks/useControls';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

type Props = NativeStackScreenProps<ControlsStackParamList, 'StocksOverview'>;

export const StocksOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading } = useStockSummary();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'<'} Back</Text>
          </Pressable>
          <Text style={styles.heading}>Stocks</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {data && (
          <View style={styles.cards}>
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('StockList', { type: 'out-of-stock', title: 'Out of stock' })}
            >
              <Text style={styles.cardLabel}>Out of stock</Text>
              <Text style={styles.cardValue}>{data.outOfStock}</Text>
            </Pressable>
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('StockList', { type: 'low-stock', title: 'Low stock' })}
            >
              <Text style={styles.cardLabel}>Low stock</Text>
              <Text style={styles.cardValue}>{data.lowStock}</Text>
            </Pressable>
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('StockList', { type: 'all', title: 'All products' })}
            >
              <Text style={styles.cardLabel}>Total products</Text>
              <Text style={styles.cardValue}>{data.totalProducts}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenContainer>
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
  back: {
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
  cards: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  cardValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
