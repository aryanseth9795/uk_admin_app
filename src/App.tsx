import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '@/store';
import { queryClient } from '@/api/queryClient';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme/colors';
import { ThemeModeProvider, useThemeMode } from '@/theme/ThemeModeContext';
import Toast from 'react-native-toast-message';

const AppShell: React.FC = () => {
  const { mode } = useThemeMode();
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.statusBar || colors.bg }}>
        <StatusBar
          style={mode === 'dark' ? 'light' : 'dark'}
          translucent={false}
          backgroundColor={colors.statusBar || colors.bg}
          // edges={['top']}
        />
        <RootNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <AppShell />
            <Toast/>
          </ThemeModeProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
