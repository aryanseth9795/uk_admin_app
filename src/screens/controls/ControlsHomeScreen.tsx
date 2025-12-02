import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ControlsStackParamList } from '@/navigation/ControlsNavigator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

type Props = NativeStackScreenProps<ControlsStackParamList, 'ControlsHome'>;

export const ControlsHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.heading}>Controls</Text>
        <View style={styles.cardsRow}>
          <Pressable style={styles.card} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardSubtitle}>Sales & orders overview</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => navigation.navigate('StocksOverview')}>
            <Text style={styles.cardTitle}>Stocks</Text>
            <Text style={styles.cardSubtitle}>Inventory health</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => navigation.navigate('Users')}>
            <Text style={styles.cardTitle}>Users</Text>
            <Text style={styles.cardSubtitle}>Registered customers</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => navigation.navigate('AdminDetails')}>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.cardSubtitle}>Admin profile & settings</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, marginTop: 20 },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  cardsRow: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
});
