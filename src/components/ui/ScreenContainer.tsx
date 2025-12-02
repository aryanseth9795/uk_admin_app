import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/theme/colors';

interface Props {
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<Props> = ({ children }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useFocusEffect(
    React.useCallback(() => {
      opacity.value = 0;
      translateY.value = 10;
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
      return () => {};
    }, [opacity, translateY]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: colors.bg,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
