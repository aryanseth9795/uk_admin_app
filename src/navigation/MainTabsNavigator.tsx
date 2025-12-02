import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrdersNavigator } from './OrdersNavigator';
import { ProductsNavigator } from './ProductsNavigator';
import { ControlsNavigator } from './ControlsNavigator';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

export type MainTabsParamList = {
  OrdersTab: undefined;
  ProductsTab: undefined;
  ControlsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#010101ff',
          borderTopColor: '#1E293B',
          height: 55,
          paddingBottom: 3,
          paddingTop: 1,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list-outline';
          if (route.name === 'OrdersTab') iconName = 'cart-outline';
          if (route.name === 'ProductsTab') iconName = 'layers-outline';
          if (route.name === 'ControlsTab') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
     
    >
      <Tab.Screen name="OrdersTab" component={OrdersNavigator} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProductsTab" component={ProductsNavigator} options={{ title: 'Products' }} />
      <Tab.Screen name="ControlsTab" component={ControlsNavigator} options={{ title: 'Controls' }} />
    </Tab.Navigator>
  );
};
