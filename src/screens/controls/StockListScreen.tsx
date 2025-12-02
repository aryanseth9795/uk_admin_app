import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { ControlsStackParamList } from '@/navigation/ControlsNavigator';
import { useStockList } from '@/api/hooks/useControls';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

type Props = NativeStackScreenProps<ControlsStackParamList, 'StockList'>;

export const StockListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { type, title } = route.params;
  const { data, isLoading } = useStockList(type);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'<'} Back</Text>
          </Pressable>
          <Text style={styles.heading}>{title}</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {!!data && data.length > 0 && (
          <FlashList
            data={data}
            keyExtractor={(item: any) => item.id}
            estimatedItemSize={80}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>Stock: {item.stock}</Text>
              </View>
            )}
          />
        )}

        {!isLoading && (!data || data.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found.</Text>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
});
