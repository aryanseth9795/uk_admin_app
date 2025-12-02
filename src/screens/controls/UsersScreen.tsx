// src/screens/UsersListScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { useUsers } from '../../api/hooks/useControls';

export const UsersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: users, isLoading, refetch } = useUsers();

  const toggleAddresses = (userId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const isExpanded = (userId: string) => expanded.has(userId);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Users</Text>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {!isLoading && (!users || users.length === 0) && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        )}

        {!!users && users.length > 0 && (
          <FlashList
            data={users}
            keyExtractor={(item:any) => item._id}
            // estimatedItemSize={130}
            refreshing={isLoading}
            onRefresh={refetch}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const expandedCard = isExpanded(item._id);
              return (
                <Animated.View
                  entering={FadeInUp.delay(index * 40)}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                >
                  <View style={styles.card}>
                    {/* Top row: main user info */}
                    <View style={styles.cardTopRow}>
                      <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userMobile}>
                          {item.mobilenumber}
                        </Text>
                      </View>

                      <View style={styles.userIdPill}>
                        <Text style={styles.userIdLabel}>User ID</Text>
                        <Text style={styles.userIdValue}>
                          {item._id.slice(0, 8)}...
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={[
                          styles.actionButton,
                          expandedCard && styles.actionButtonActive,
                        ]}
                        onPress={() => toggleAddresses(item._id)}
                      >
                        <Text
                          style={[
                            styles.actionText,
                            expandedCard && styles.actionTextActive,
                          ]}
                        >
                          Addresses
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.actionButton, styles.actionButtonOutline]}
                        onPress={() =>
                          navigation.navigate('UserOrderHistory', {
                            userId: item._id,
                          })
                        }
                      >
                        <Text style={styles.actionTextOutline}>
                          Recent Orders
                        </Text>
                      </Pressable>
                    </View>

                    {/* Expanded Addresses */}
                    {expandedCard && (
                      <Animated.View layout={Layout.springify()}>
                        <View style={styles.addressContainer}>
                          {item.addresses && item.addresses.length > 0 ? (
                            item.addresses.map((addr:any, idx:number) => (
                              <View key={idx} style={styles.addressCard}>
                                <View style={styles.addressHeaderRow}>
                                  <Text style={styles.addressLabel}>
                                    {addr.label}
                                  </Text>
                                  <Text style={styles.addressName}>
                                    {addr.Receiver_Name}
                                  </Text>
                                </View>
                                <Text style={styles.addressLine}>
                                  {addr.Address_Line1}
                                </Text>
                                {addr.Address_Line2 ? (
                                  <Text style={styles.addressLine}>
                                    {addr.Address_Line2}
                                  </Text>
                                ) : null}
                                <Text style={styles.addressLine}>
                                  {addr.City} - {addr.pincode}
                                </Text>
                                <Text style={styles.addressPhone}>
                                  📞 {addr.Receiver_MobileNumber}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noAddressText}>
                              No addresses saved for this user.
                            </Text>
                          )}
                        </View>
                      </Animated.View>
                    )}
                  </View>
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
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as any,
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userMobile: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  userIdPill: {
    width:100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  userIdLabel: {
    fontSize: 10,
    color: colors.muted,
  },
  userIdValue: {
    fontSize: 11,
    color: colors.header,
    fontWeight: '500',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    columnGap: spacing.sm,
  } as any,
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBg,
  },
  actionButtonActive: {
    backgroundColor: colors.tint,
  },
  actionText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#020617',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.tint,
  },
  actionTextOutline: {
    fontSize: 12,
    color: colors.tint,
    fontWeight: '500',
  },

  addressContainer: {
    marginTop: spacing.sm,
  },
  addressCard: {
    backgroundColor: '#0206170A',
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  } as any,
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.header,
  },
  addressName: {
    fontSize: 11,
    color: colors.muted,
  },
  addressLine: {
    fontSize: 11,
    color: colors.text,
    marginTop: 1,
  },
  addressPhone: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  noAddressText: {
    fontSize: 12,
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

export default UsersScreen;
