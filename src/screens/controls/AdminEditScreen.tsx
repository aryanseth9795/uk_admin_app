import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ControlsStackParamList } from '@/navigation/ControlsNavigator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAdminProfile, useUpdateAdminProfile } from '@/api/hooks/useAdmin';

type Props = NativeStackScreenProps<ControlsStackParamList, 'AdminEdit'>;

export const AdminEditScreen: React.FC<Props> = ({ navigation }) => {
  const { data } = useAdminProfile();
  const { mutateAsync, isPending } = useUpdateAdminProfile();

  const [name, setName] = useState(data?.name ?? '');
  const [phone, setPhone] = useState(data?.phone ?? '');
  const [avatar, setAvatar] = useState(data?.avatar ?? '');

  const handleSave = async () => {
    await mutateAsync({ name, phone, avatar });
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'<'} Back</Text>
          </Pressable>
          <Text style={styles.heading}>Edit profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {!data && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}

        {data && (
          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={colors.muted}
              value={avatar}
              onChangeText={setAvatar}
              autoCapitalize="none"
            />

            <Pressable
              style={[styles.button, isPending && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save changes</Text>
              )}
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
    color: colors.muted,
    fontSize: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminEditScreen;
