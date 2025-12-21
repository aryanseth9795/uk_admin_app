import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProductsStackParamList } from '@/navigation/ProductsNavigator';
import { 
  useCategories, 
  useSubCategories, 
  useCreateSubSubCategory,
  Category,
  SubCategory,
} from '@/api/hooks/useCategory';

type Props = NativeStackScreenProps<ProductsStackParamList, 'SubSubCategoryForm'>;

const SubSubCategoryFormScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [subSubCategoryName, setSubSubCategoryName] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useCategories();
  
  // Fetch subcategories when category is selected
  const { data: subCategories, isLoading: loadingSubCategories } = useSubCategories(
    selectedCategory?._id
  );
  
  const createSubSubCategoryMutation = useCreateSubSubCategory();

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory(null);
  }, [selectedCategory]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    if (!selectedSubCategory) {
      Alert.alert('Validation Error', 'Please select a subcategory');
      return;
    }

    if (!subSubCategoryName.trim()) {
      Alert.alert('Validation Error', 'Please enter a sub-subcategory name');
      return;
    }

    try {
      await createSubSubCategoryMutation.mutateAsync({
        subCategoryId: selectedSubCategory._id,
        name: subSubCategoryName.trim(),
      });

      // Success notification
      Alert.alert(
        'Success',
        'Sub-SubCategory created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('ProductsList');
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create sub-subcategory. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const isLoading = createSubSubCategoryMutation.isPending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Sub-SubCategory</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="layers-outline" size={32} color="white" />
              </LinearGradient>
            </View>

            <Text style={styles.cardTitle}>Create New Sub-SubCategory</Text>
            <Text style={styles.cardDescription}>
              Select category and subcategory, then add a new sub-subcategory
            </Text>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Category</Text>
              <Pressable
                onPress={() => setShowCategoryPicker(true)}
                disabled={loadingCategories || isLoading}
                style={styles.selectorButton}
              >
                <View style={styles.selectorContent}>
                  {loadingCategories ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                  ) : (
                    <>
                      <Text style={[
                        styles.selectorText,
                        !selectedCategory && styles.selectorPlaceholder
                      ]}>
                        {selectedCategory?.name || 'Select a category'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#64748b" />
                    </>
                  )}
                </View>
              </Pressable>
            </View>

            {/* SubCategory Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select SubCategory</Text>
              <Pressable
                onPress={() => setShowSubCategoryPicker(true)}
                disabled={!selectedCategory || loadingSubCategories || isLoading}
                style={[
                  styles.selectorButton,
                  !selectedCategory && styles.selectorDisabled
                ]}
              >
                <View style={styles.selectorContent}>
                  {loadingSubCategories ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                  ) : (
                    <>
                      <Text style={[
                        styles.selectorText,
                        !selectedSubCategory && styles.selectorPlaceholder,
                        !selectedCategory && styles.selectorTextDisabled
                      ]}>
                        {selectedSubCategory?.name || 
                         (!selectedCategory ? 'Select category first' : 'Select a subcategory')}
                      </Text>
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={!selectedCategory ? "#cbd5e1" : "#64748b"} 
                      />
                    </>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Sub-SubCategory Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sub-SubCategory Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Face Cream, Shampoo, Matte Lipstick"
                placeholderTextColor="#94a3b8"
                value={subSubCategoryName}
                onChangeText={setSubSubCategoryName}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || isLoading) && styles.submitButtonPressed,
              ]}
            >
              <LinearGradient
                colors={isLoading ? ['#94a3b8', '#64748b'] : ['#F59E0B', '#D97706']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.submitButtonText}>Creating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Create Sub-SubCategory</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable
                onPress={() => setShowCategoryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            {categories && categories.length > 0 ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.categoryItem,
                      pressed && styles.categoryItemPressed,
                      selectedCategory?._id === item._id && styles.categoryItemSelectedOrange,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryItemText,
                      selectedCategory?._id === item._id && styles.categoryItemTextSelectedOrange,
                    ]}>
                      {item.name}
                    </Text>
                    {selectedCategory?._id === item._id && (
                      <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                    )}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>No categories found</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* SubCategory Picker Modal */}
      <Modal
        visible={showSubCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubCategoryPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select SubCategory</Text>
              <Pressable
                onPress={() => setShowSubCategoryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            {subCategories && subCategories.length > 0 ? (
              <FlatList
                data={subCategories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.categoryItem,
                      pressed && styles.categoryItemPressed,
                      selectedSubCategory?._id === item._id && styles.categoryItemSelectedOrange,
                    ]}
                    onPress={() => {
                      setSelectedSubCategory(item);
                      setShowSubCategoryPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryItemText,
                      selectedSubCategory?._id === item._id && styles.categoryItemTextSelectedOrange,
                    ]}>
                      {item.name}
                    </Text>
                    {selectedSubCategory?._id === item._id && (
                      <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                    )}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="albums-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>No subcategories found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Please create a subcategory for this category first
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  selectorButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  selectorPlaceholder: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  selectorTextDisabled: {
    color: '#cbd5e1',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoryItemPressed: {
    backgroundColor: '#f1f5f9',
  },
  categoryItemSelectedOrange: {
    backgroundColor: '#fef3c7',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  categoryItemTextSelectedOrange: {
    color: '#D97706',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SubSubCategoryFormScreen;
