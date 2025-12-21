import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsListScreen } from '@/screens/products/ProductsListScreen';
import { ProductDetailScreen } from '@/screens/products/ProductDetailScreen';
import ProductFormScreen from '@/screens/products/ProductFormScreen';
import CategoryFormScreen from '@/screens/products/CategoryFormScreen';
import SubCategoryFormScreen from '@/screens/products/SubCategoryFormScreen';
import SubSubCategoryFormScreen from '@/screens/products/SubSubCategoryFormScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string } | undefined;
  CategoryForm: undefined;
  SubCategoryForm: undefined;
  SubSubCategoryForm: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export const ProductsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductsList" component={ProductsListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} />
    <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
    <Stack.Screen name="SubCategoryForm" component={SubCategoryFormScreen} />
    <Stack.Screen name="SubSubCategoryForm" component={SubSubCategoryFormScreen} />
  </Stack.Navigator>
);
