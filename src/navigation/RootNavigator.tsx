import { USE_MOCKS } from '@/utils/devToggle';
import React from 'react';
import {  NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';
import { useAppSelector } from '@/store';

export const RootNavigator: React.FC = () => {
  const status = useAppSelector((s) => s.auth.status);
  // const isAuthed = USE_MOCKS ? status !== 'unauthenticated' : status === 'authenticated';
  const isAuthed = status === 'authenticated';
  return (
    <NavigationContainer>
      {isAuthed ? <MainTabsNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
