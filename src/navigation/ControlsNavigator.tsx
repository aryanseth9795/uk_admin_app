import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ControlsHomeScreen } from "@/screens/controls/ControlsHomeScreen";
import ReportsScreen from "@/screens/controls/ReportsScreen";
import StocksOverviewScreen from "@/screens/controls/StocksOverviewScreen";
import { StockListScreen } from "@/screens/controls/StockListScreen";
import BrandsListScreen from "@/screens/controls/BrandsListScreen";
import BrandProductsScreen from "@/screens/controls/BrandProductsScreen";
import UsersScreen from "@/screens/controls/UsersScreen";
import UserOrderHistoryScreen from "@/screens/controls/UserOrderHistoryScreen";
import AdminDetailsScreen from "@/screens/controls/AdminDetailsScreen";
import { AdminEditScreen } from "@/screens/controls/AdminEditScreen";

import { ProductDetailScreen } from "@/screens/products/ProductDetailScreen";

export type ControlsStackParamList = {
  ControlsHome: undefined;
  Reports: undefined;
  StocksOverview: undefined;
  StockList: { type: "out-of-stock" | "low-stock" | "all"; title: string };
  BrandsList: undefined;
  BrandProducts: { brandName: string };
  ProductDetail: { productId: string };
  Users: undefined;
  UserOrderHistory: { userId: string; userName?: string };
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
    <Stack.Screen name="BrandsList" component={BrandsListScreen} />
    <Stack.Screen name="BrandProducts" component={BrandProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Users" component={UsersScreen} />
    <Stack.Screen name="UserOrderHistory" component={UserOrderHistoryScreen} />
    <Stack.Screen name="AdminDetails" component={AdminDetailsScreen} />
    <Stack.Screen name="AdminEdit" component={AdminEditScreen} />
  </Stack.Navigator>
);
