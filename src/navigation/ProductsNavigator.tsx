import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsListScreen } from '@/screens/products/ProductsListScreen';
import { ProductDetailScreen } from '@/screens/products/ProductDetailScreen';
import ProductFormScreen from '@/screens/products/ProductFormScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string } | undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export const ProductsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductsList" component={ProductsListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} />
  </Stack.Navigator>
);
