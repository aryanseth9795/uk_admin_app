import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ControlsHomeScreen } from '@/screens/controls/ControlsHomeScreen';
import ReportsScreen from '@/screens/controls/ReportsScreen';
import { StocksOverviewScreen } from '@/screens/controls/StocksOverviewScreen';
import { StockListScreen } from '@/screens/controls/StockListScreen';
import { UsersScreen } from '@/screens/controls/UsersScreen';
import { AdminDetailsScreen } from '@/screens/controls/AdminDetailsScreen';
import { AdminEditScreen } from '@/screens/controls/AdminEditScreen';

export type ControlsStackParamList = {
  ControlsHome: undefined;
  Reports: undefined;
  StocksOverview: undefined;
  StockList: { type: 'out-of-stock' | 'low-stock' | 'all'; title: string };
  Users: undefined;
  AdminDetails: undefined;
  AdminEdit: undefined;
};

const Stack = createNativeStackNavigator<ControlsStackParamList>();

export const ControlsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ControlsHome" component={ControlsHomeScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="StocksOverview" component={StocksOverviewScreen} />
    <Stack.Screen name="StockList" component={StockListScreen} />
    <Stack.Screen name="Users" component={UsersScreen} />
    <Stack.Screen name="AdminDetails" component={AdminDetailsScreen} />
    <Stack.Screen name="AdminEdit" component={AdminEditScreen} />
  </Stack.Navigator>
);
