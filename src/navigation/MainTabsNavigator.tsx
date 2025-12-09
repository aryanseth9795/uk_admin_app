// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { OrdersNavigator } from './OrdersNavigator';
// import { ProductsNavigator } from './ProductsNavigator';
// import { ControlsNavigator } from './ControlsNavigator';
// import { Ionicons } from '@expo/vector-icons';
// import { colors } from '@/theme/colors';

// export type MainTabsParamList = {
//   OrdersTab: undefined;
//   ProductsTab: undefined;
//   ControlsTab: undefined;
// };

// const Tab = createBottomTabNavigator<MainTabsParamList>();

// export const MainTabsNavigator: React.FC = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }: any) => ({
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: '#5d00ffff',
//           borderTopColor: '#1E293B',
//           height: 55,
//           paddingBottom: 3,
//           paddingTop: 1,
//         },
//         tabBarActiveTintColor: colors.tint,
//         tabBarInactiveTintColor: colors.muted,
//         tabBarIcon: ({ color, size }: any) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'list-outline';
//           if (route.name === 'OrdersTab') iconName = 'cart-outline';
//           if (route.name === 'ProductsTab') iconName = 'layers-outline';
//           if (route.name === 'ControlsTab') iconName = 'settings-outline';
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//       })}
     
//     >
//       <Tab.Screen name="ProductsTab" component={ProductsNavigator} options={{ title: 'Products' }} />
//       <Tab.Screen name="OrdersTab" component={OrdersNavigator} options={{ title: 'Orders' }} />
//       <Tab.Screen name="ControlsTab" component={ControlsNavigator} options={{ title: 'Controls' }} />
//     </Tab.Navigator>
//   );
// };
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrdersNavigator } from './OrdersNavigator';
import { ProductsNavigator } from './ProductsNavigator';
import { ControlsNavigator } from './ControlsNavigator';
import { Ionicons } from '@expo/vector-icons';

// Define theme colors locally to ensure exact match with CreateProductScreen
const THEME = {
  primary: '#4f46e5',   // Indigo 600
  inactive: '#94a3b8',  // Slate 400
  background: '#ffffff',
  border: '#e2e8f0',
};

export type MainTabsParamList = {
  OrdersTab: undefined;
  ProductsTab: undefined;
  ControlsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // 1. Clean White Background with soft Shadow (Matches Card style)
        tabBarStyle: {
          backgroundColor: THEME.background,
          borderTopWidth: 1,
          borderTopColor: THEME.border,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 5,
          paddingTop: 6,
          elevation: 8, // Android Shadow
          shadowColor: '#000', // iOS Shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        // 2. Typography Settings
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 0,
        },
        // 3. Theme Colors
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.inactive,
        // 4. Icon Logic
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list-outline';
          
          // Use filled icons for active state, outline for inactive
          if (route.name === 'OrdersTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'ProductsTab') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'ControlsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="ProductsTab" 
        component={ProductsNavigator} 
        options={{ title: 'Products' }} 
      />
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersNavigator} 
        options={{ title: 'Orders' }} 
      />
      <Tab.Screen 
        name="ControlsTab" 
        component={ControlsNavigator} 
        options={{ title: 'Controls' }} 
      />
    </Tab.Navigator>
  );
};