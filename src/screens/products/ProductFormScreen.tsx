import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  useCreateAdminProduct,
  useGetProductDetail,
  useUpdateProduct,
} from "../../api/hooks/useAdmin";
import {
  useCategories,
  useSubCategories,
  useSubSubCategories,
  Category,
  SubCategory,
  SubSubCategory,
} from "../../api/hooks/useCategory";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ProductsStackParamList } from "@/navigation/ProductsNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ----- Constants & Enums -----

const MEASUREMENT_UNITS = ["", "ml", "L", "g", "kg", "pcs"] as const;

// ----- Types -----

type AssetLike = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  publicId?: string; // For existing images from backend
  isExisting?: boolean; // Flag to differentiate from new picks
};

type DeletedImage = {
  publicId: string;
  url: string;
  type: "thumbnail" | "variant";
  variantIndex?: number;
};

type PriceTierForm = {
  minQuantity: string;
  price: string;
  discount: string;
};

type VariantForm = {
  packOf: string;
  measurementValue: string;
  measurementUnit: string;
  measurementLabel: string;
  mrp: string;
  stock: string;
  isActive: boolean;
  sellingPrices: PriceTierForm[];
  images: AssetLike[];
  isExpanded?: boolean;
};

// ----- UI Components -----

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  style?: any;
}

const InputField = React.memo<InputFieldProps>(
  ({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    keyboardType = "default",
    style,
  }) => (
    <View style={[styles.inputGroup, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  )
);

InputField.displayName = "InputField";

const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ProductsStackParamList, "ProductForm">>();

  // Get productId from route params (if editing)
  const productId = route.params?.productId;
  const isEditMode = !!productId;

  // Fetch product data if editing
  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductDetail(productId || "");
  const product = productData as any;

  // ----- State -----
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");

  // Category state with cascading dropdowns
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] =
    useState<SubSubCategory | null>(null);

  // Modal states for category selectors
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showSubSubCategoryModal, setShowSubSubCategoryModal] = useState(false);

  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");

  const [deliveryCancel, setDeliveryCancel] = useState(false);
  const [deliveryReturnable, setDeliveryReturnable] = useState(false);
  const [deliveryWarranty, setDeliveryWarranty] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [thumbnail, setThumbnail] = useState<AssetLike | null>(null);

  const [variants, setVariants] = useState<VariantForm[]>([
    {
      packOf: "1",
      measurementValue: "",
      measurementUnit: "",
      measurementLabel: "",
      mrp: "",
      stock: "",
      isActive: true,
      sellingPrices: [{ minQuantity: "1", price: "", discount: "0" }],
      images: [],
      isExpanded: true,
    },
  ]);

  // Track deleted images for update mode
  const [deletedImages, setDeletedImages] = useState<DeletedImage[]>([]);

  // Fetch categories and sub-categories dynamically
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: subCategories, isLoading: loadingSubCategories } =
    useSubCategories(selectedCategory?._id);
  const { data: subSubCategories, isLoading: loadingSubSubCategories } =
    useSubSubCategories(selectedSubCategory?._id);

  const {
    mutateAsync: createProduct,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useCreateAdminProduct();

  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct();

  const isLoading = isCreating || isUpdating;

  // Cascading reset: when category changes, reset subcategory and sub-subcategory
  useEffect(() => {
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  }, [selectedCategory]);

  // Reset sub-subcategory when subcategory changes
  useEffect(() => {
    setSelectedSubSubCategory(null);
  }, [selectedSubCategory]);

  useEffect(() => {
    if (isCreateError) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: String(createError),
      });
    }
  }, [isCreateError, createError]);

  // Pre-fill form data when editing
  useEffect(() => {
    if (isEditMode && product && !isLoadingProduct) {
      // Basic details
      setName(product.name || "");
      setBrand(product.brand || "");
      setSlug(product.slug || "");
      setDescription(product.description || "");
      setTagsInput(product.tags?.join(", ") || "");
      setIsActive(product.isActive ?? true);

      // Delivery options
      setDeliveryCancel(product.deliveryOption?.isCancel || false);
      setDeliveryReturnable(product.deliveryOption?.isReturnable || false);
      setDeliveryWarranty(product.deliveryOption?.isWarranty || false);

      // Thumbnail
      if (product.thumbnail) {
        setThumbnail({
          uri: product.thumbnail.secureUrl || product.thumbnail.url,
          fileName: product.thumbnail.publicId,
          mimeType: "image/jpeg",
          publicId: product.thumbnail.publicId,
          isExisting: true,
        });
      }

      // Categories - find and set from fetched data
      if (categories && product.category) {
        const cat = categories.find(
          (c: Category) => c.name === product.category
        );
        if (cat) setSelectedCategory(cat);
      }

      if (subCategories && product.subCategory) {
        const subCat = subCategories.find(
          (sc: SubCategory) => sc.name === product.subCategory
        );
        if (subCat) setSelectedSubCategory(subCat);
      }

      if (subSubCategories && product.subSubCategory) {
        const subSubCat = subSubCategories.find(
          (ssc: SubSubCategory) => ssc.name === product.subSubCategory
        );
        if (subSubCat) setSelectedSubSubCategory(subSubCat);
      }

      // Variants
      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v: any, idx: number) => ({
            packOf: v.packOf?.toString() || "1",
            measurementValue: v.measurement?.value?.toString() || "",
            measurementUnit: v.measurement?.unit || "",
            measurementLabel: v.measurement?.label || "",
            mrp: v.mrp?.toString() || "",
            stock: v.stock?.toString() || "",
            isActive: v.isActive ?? true,
            sellingPrices: v.sellingPrices?.map((sp: any) => ({
              minQuantity: sp.minQuantity?.toString() || "1",
              price: sp.price?.toString() || "",
              discount: sp.discount?.toString() || "0",
            })) || [{ minQuantity: "1", price: "", discount: "0" }],
            images:
              v.images?.map((img: any) => ({
                uri: img.secureUrl || img.url,
                fileName: img.publicId,
                mimeType: "image/jpeg",
                publicId: img.publicId,
                isExisting: true,
              })) || [],
            isExpanded: idx === 0,
            _id: v._id,
          }))
        );
      }
    }
  }, [
    isEditMode,
    product,
    isLoadingProduct,
    categories,
    subCategories,
    subSubCategories,
  ]);

  // ----- Slug Helpers -----

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const buildUniqueSlug = () => {
    const parts: string[] = [];

    if (brand) parts.push(brand);
    if (name) parts.push(name);
    if (selectedCategory?.name) parts.push(selectedCategory.name);
    if (selectedSubCategory?.name) parts.push(selectedSubCategory.name);
    if (selectedSubSubCategory?.name) parts.push(selectedSubSubCategory.name);

    const firstVariant = variants[0];
    if (firstVariant) {
      if (firstVariant.packOf) parts.push(`pack-${firstVariant.packOf}`);
      if (firstVariant.measurementValue || firstVariant.measurementUnit) {
        parts.push(
          `${firstVariant.measurementValue}${firstVariant.measurementUnit}`
        );
      }
    }

    const base = slugify(parts.join(" "));
    const shortId = Date.now().toString(36).slice(-4);
    return base ? `${base}-${shortId}` : shortId;
  };

  // ----- Logic Helpers -----

  const toggleVariantExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVariants((prev) =>
      prev.map((v, i) => ({
        ...v,
        isExpanded: i === index ? !v.isExpanded : false,
      }))
    );
  };

  const askImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow gallery access to upload images."
      );
      return false;
    }
    return true;
  };

  const pickThumbnail = async () => {
    if (!(await askImagePermission())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Track deleted thumbnail if replacing existing one
        if (isEditMode && thumbnail?.isExisting && thumbnail?.publicId) {
          setDeletedImages((prev) => [
            ...prev,
            {
              publicId: thumbnail.publicId!,
              url: thumbnail.uri,
              type: "thumbnail",
            },
          ]);
        }

        setThumbnail({
          uri: asset.uri,
          fileName: asset.fileName || `thumb-${Date.now()}.jpg`,
          mimeType: asset.mimeType || "image/jpeg",
        });
      }
    } catch (err) {
      console.error("Image Picker Error", err);
      Alert.alert("Error", "Could not select image. Please try again.");
    }
  };

  const pickVariantImages = async (vIndex: number) => {
    if (!(await askImagePermission())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setVariants((prev) => {
          const copy = [...prev];
          const newImages = result.assets.map((a, i) => ({
            uri: a.uri,
            fileName: a.fileName || `variant-${Date.now()}-${i}.jpg`,
            mimeType: a.mimeType || "image/jpeg",
          }));
          copy[vIndex].images = [...copy[vIndex].images, ...newImages];
          return copy;
        });
      }
    } catch (err) {
      console.error("Variant Picker Error", err);
    }
  };

  const updateVariantField = useCallback(
    (idx: number, key: keyof VariantForm, value: any) => {
      setVariants((prev) => {
        const copy = [...prev];
        (copy[idx] as any)[key] = value;
        return copy;
      });
    },
    []
  );

  const updatePriceTierField = useCallback(
    (
      vIndex: number,
      pIndex: number,
      key: keyof PriceTierForm,
      value: string
    ) => {
      setVariants((prev) => {
        const copy = [...prev];
        const tiers = [...copy[vIndex].sellingPrices];

        if (key === "price") {
          const mrp = parseFloat(copy[vIndex].mrp) || 0;
          const price = parseFloat(value) || 0;
          let discount = "0";
          if (mrp > 0 && price > 0 && price < mrp) {
            discount = (((mrp - price) / mrp) * 100).toFixed(2);
          }
          tiers[pIndex] = { ...tiers[pIndex], price: value, discount };
        } else {
          tiers[pIndex] = { ...tiers[pIndex], [key]: value };
        }

        copy[vIndex].sellingPrices = tiers;
        return copy;
      });
    },
    []
  );

  const updateVariantMRP = useCallback((vIndex: number, mrpValue: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].mrp = mrpValue;
      const mrp = parseFloat(mrpValue) || 0;
      copy[vIndex].sellingPrices = copy[vIndex].sellingPrices.map((tier) => {
        const price = parseFloat(tier.price) || 0;
        let discount = "0";
        if (mrp > 0 && price > 0 && price < mrp) {
          discount = (((mrp - price) / mrp) * 100).toFixed(2);
        }
        return { ...tier, discount };
      });
      return copy;
    });
  }, []);

  const addVariant = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVariants((prev) => [
      ...prev.map((v) => ({ ...v, isExpanded: false })),
      {
        packOf: "1",
        measurementValue: "",
        measurementUnit: "",
        measurementLabel: "",
        mrp: "",
        stock: "",
        isActive: true,
        sellingPrices: [{ minQuantity: "1", price: "", discount: "0" }],
        images: [],
        isExpanded: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addPriceTier = (vIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].sellingPrices.push({
        minQuantity: "1",
        price: "",
        discount: "0",
      });
      return copy;
    });
  };

  const removePriceTier = (vIndex: number, pIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].sellingPrices = copy[vIndex].sellingPrices.filter(
        (_, i) => i !== pIndex
      );
      return copy;
    });
  };

  const removeVariantImage = (vIndex: number, imgIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      const imageToRemove = copy[vIndex].images[imgIndex];

      // Track deleted image ID if it's an existing image
      if (imageToRemove.isExisting && imageToRemove.publicId) {
        setDeletedImages((prev) => [
          ...prev,
          {
            publicId: imageToRemove.publicId!,
            url: imageToRemove.uri,
            type: "variant",
            variantIndex: vIndex,
          },
        ]);
      }

      copy[vIndex].images = copy[vIndex].images.filter(
        (_, i) => i !== imgIndex
      );
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim()) {
      Alert.alert("Missing Fields", "Please fill in Brand and Name.");
      return;
    }
    if (!thumbnail) {
      Alert.alert("Missing Image", "Please add a product thumbnail.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const finalSlug = buildUniqueSlug();
    setSlug(finalSlug);

    const productPayload: any = {
      name,
      brand,
      slug: finalSlug,
      categoryId: selectedSubSubCategory?._id,
      tags,
      description,
      deliveryOption: {
        isCancel: deliveryCancel,
        isReturnable: deliveryReturnable,
        isWarranty: deliveryWarranty,
      },
      isActive,
      variants: variants.map((v) => {
        const hasMeasurement =
          v.measurementValue || v.measurementUnit || v.measurementLabel;
        return {
          packOf: Number(v.packOf || 0),
          measurement: hasMeasurement
            ? {
                value: Number(v.measurementValue) || undefined,
                unit: v.measurementUnit || undefined,
                label: v.measurementLabel || undefined,
              }
            : undefined,
          mrp: Number(v.mrp || 0),
          stock: Number(v.stock || 0),
          isActive: v.isActive,
          images: [],
          sellingPrices: v.sellingPrices.map((p) => ({
            minQuantity: Number(p.minQuantity || 1),
            price: Number(p.price || 0),
            discount: Number(p.discount || 0),
          })),
        };
      }),
    };

    // Add productId and deletedImages for update mode
    if (isEditMode) {
      productPayload.productId = productId;

      if (deletedImages.length > 0) {
        productPayload.deletedImages = deletedImages;
      }
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(productPayload));

    // Only append thumbnail if it's a new image (not existing)
    if (!thumbnail.isExisting) {
      const thumbUri =
        Platform.OS === "android"
          ? thumbnail.uri
          : thumbnail.uri.replace("file://", "");
      const thumbName =
        thumbnail.fileName || thumbUri.split("/").pop() || "thumbnail.jpg";
      const thumbType = thumbnail.mimeType || "image/jpeg";

      formData.append("thumbnail", {
        uri: thumbUri,
        name: thumbName,
        type: thumbType,
      } as any);
    }

    variants.forEach((v, vIndex) => {
      // Only upload new images (not existing ones)
      const newImages = v.images.filter((img) => !img.isExisting);

      newImages.forEach((img, imgIndex) => {
        const vImgUri =
          Platform.OS === "android" ? img.uri : img.uri.replace("file://", "");
        const vImgName =
          img.fileName ||
          vImgUri.split("/").pop() ||
          `v-${vIndex}-${imgIndex}.jpg`;
        const vImgType = img.mimeType || "image/jpeg";

        formData.append(`variantImages[${vIndex}]`, {
          uri: vImgUri,
          name: vImgName,
          type: vImgType,
        } as any);
      });
    });

    const res: any = isEditMode
      ? await updateProduct({ productId: productId!, formData })
      : await createProduct({ formData });
    Toast.show({
      type: "success",
      text1:
        res?.message || (isEditMode ? "Product Updated!" : "Product Created!"),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading state for edit mode */}
          {isEditMode && isLoadingProduct ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={{ marginTop: 16, fontSize: 16, color: "#64748b" }}>
                Loading product data...
              </Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <LinearGradient
                colors={["#6366f1", "#4f46e5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.headerTitle}>
                    {isEditMode ? "Edit Product" : "Add New Product"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    UK Cosmetics & Gift Center
                  </Text>
                </View>
              </LinearGradient>

              {/* 1. General Info */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View
                    style={[styles.iconBox, { backgroundColor: "#e0e7ff" }]}
                  >
                    <Text>📝</Text>
                  </View>
                  <Text style={styles.cardTitle}>Basic Details</Text>
                </View>

                <InputField
                  label="Brand Name"
                  value={brand}
                  onChange={setBrand}
                  placeholder="e.g. Lakme"
                />

                <InputField
                  label="Product Name"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. 9to5 Lipstick"
                />

                {/* Slug - read-only, auto generated */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Slug (auto-generated)</Text>
                  <View
                    style={[
                      styles.input,
                      {
                        backgroundColor: "#f1f5f9",
                        borderStyle: "dashed",
                        borderColor: "#cbd5e1",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: slug ? "#334155" : "#94a3b8",
                        fontSize: 14,
                      }}
                      numberOfLines={1}
                    >
                      {slug || "Slug will be generated when you save"}
                    </Text>
                  </View>
                </View>

                {/* Category Selectors */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category *</Text>
                  <Pressable
                    onPress={() => setShowCategoryModal(true)}
                    disabled={loadingCategories || isLoading}
                    style={styles.selectorButton}
                  >
                    <View style={styles.selectorContent}>
                      {loadingCategories ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.selectorText,
                              !selectedCategory && styles.selectorPlaceholder,
                            ]}
                          >
                            {selectedCategory?.name || "Select a category"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#64748b"
                          />
                        </>
                      )}
                    </View>
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>SubCategory</Text>
                  <Pressable
                    onPress={() => setShowSubCategoryModal(true)}
                    disabled={
                      !selectedCategory || loadingSubCategories || isLoading
                    }
                    style={[
                      styles.selectorButton,
                      !selectedCategory && styles.selectorDisabled,
                    ]}
                  >
                    <View style={styles.selectorContent}>
                      {loadingSubCategories ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.selectorText,
                              !selectedSubCategory &&
                                styles.selectorPlaceholder,
                              !selectedCategory && styles.selectorTextDisabled,
                            ]}
                          >
                            {selectedSubCategory?.name ||
                              (!selectedCategory
                                ? "Select category first"
                                : "Select a subcategory")}
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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sub-SubCategory (Optional)</Text>
                  <Pressable
                    onPress={() => setShowSubSubCategoryModal(true)}
                    disabled={
                      !selectedSubCategory ||
                      loadingSubSubCategories ||
                      isLoading
                    }
                    style={[
                      styles.selectorButton,
                      !selectedSubCategory && styles.selectorDisabled,
                    ]}
                  >
                    <View style={styles.selectorContent}>
                      {loadingSubSubCategories ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.selectorText,
                              !selectedSubSubCategory &&
                                styles.selectorPlaceholder,
                              !selectedSubCategory &&
                                styles.selectorTextDisabled,
                            ]}
                          >
                            {selectedSubSubCategory?.name ||
                              (!selectedSubCategory
                                ? "Select subcategory first"
                                : "Select specific type")}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={!selectedSubCategory ? "#cbd5e1" : "#64748b"}
                          />
                        </>
                      )}
                    </View>
                  </Pressable>
                </View>

                <InputField
                  label="Tags (Comma separated)"
                  value={tagsInput}
                  onChange={setTagsInput}
                  placeholder="organic, sale, new"
                />
                <InputField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Product details..."
                  multiline
                />
              </View>

              {/* 2. Media */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View
                    style={[styles.iconBox, { backgroundColor: "#fce7f3" }]}
                  >
                    <Text>📸</Text>
                  </View>
                  <Text style={styles.cardTitle}>Primary Media</Text>
                </View>
                <Text style={styles.label}>Main Thumbnail *</Text>
                <TouchableOpacity
                  onPress={pickThumbnail}
                  style={styles.thumbnailUploadArea}
                >
                  {thumbnail ? (
                    <View style={styles.fullWidthImageContainer}>
                      <Image
                        source={{ uri: thumbnail.uri }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.editImageBadge}>
                        <Ionicons name="pencil" size={16} color="white" />
                        <Text style={styles.editImageText}>Edit</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color="#cbd5e1"
                      />
                      <Text style={styles.uploadText}>
                        Tap to upload cover image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* 3. Variants */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>Product Variants</Text>
                <TouchableOpacity
                  onPress={addVariant}
                  style={styles.addVariantButton}
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addVariantButtonText}>Add Variant</Text>
                </TouchableOpacity>
              </View>

              {variants.map((v, vIndex) => (
                <View key={vIndex} style={[styles.card, styles.variantCard]}>
                  <TouchableOpacity
                    style={styles.variantHeader}
                    onPress={() => toggleVariantExpand(vIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.variantHeaderLeft}>
                      <View
                        style={[
                          styles.variantNumberBadge,
                          !v.isActive && styles.inactiveBadge,
                        ]}
                      >
                        <Text style={styles.variantNumberText}>
                          #{vIndex + 1}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.variantTitle}>
                          {v.measurementValue
                            ? `${v.measurementValue}${v.measurementUnit}`
                            : `Variant ${vIndex + 1}`}
                        </Text>
                        <Text style={styles.variantSubtitle}>
                          Stock: {v.stock || 0} • MRP: ₹{v.mrp || 0}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {variants.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeVariant(vIndex)}
                          style={styles.iconButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      )}
                      <Ionicons
                        name={v.isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#64748b"
                      />
                    </View>
                  </TouchableOpacity>

                  {v.isExpanded && (
                    <View style={styles.variantBody}>
                      <View style={styles.divider} />

                      <View style={styles.row}>
                        <InputField
                          label="Pack Of"
                          value={v.packOf}
                          onChange={(t: string) =>
                            updateVariantField(vIndex, "packOf", t)
                          }
                          style={styles.flexOneMarginRight}
                          keyboardType="numeric"
                          placeholder="1"
                        />
                        <InputField
                          label="Stock"
                          value={v.stock}
                          onChange={(t: string) =>
                            updateVariantField(vIndex, "stock", t)
                          }
                          style={styles.flexOneMarginLeft}
                          keyboardType="numeric"
                          placeholder="100"
                        />
                      </View>

                      {/* Measurement */}
                      <Text style={styles.subLabel}>Measurement</Text>
                      <View style={styles.measurementRow}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              style={styles.inputSm}
                              placeholder="Value (200)"
                              keyboardType="numeric"
                              value={v.measurementValue}
                              onChangeText={(t) =>
                                updateVariantField(
                                  vIndex,
                                  "measurementValue",
                                  t
                                )
                              }
                            />
                          </View>

                          <View style={styles.measurementPickerWrapper}>
                            <Picker
                              selectedValue={v.measurementUnit}
                              onValueChange={(val) =>
                                updateVariantField(
                                  vIndex,
                                  "measurementUnit",
                                  val
                                )
                              }
                              style={styles.pickerSm}
                              mode="dropdown"
                              dropdownIconColor="#000"
                            >
                              {MEASUREMENT_UNITS.map((u) => (
                                <Picker.Item
                                  key={u}
                                  label={u || "Unit"}
                                  value={u}
                                  color="#000000"
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>

                        <View style={{ width: "100%" }}>
                          <TextInput
                            style={styles.inputSm}
                            placeholder="Label (e.g. 200ml)"
                            value={v.measurementLabel}
                            onChangeText={(t) =>
                              updateVariantField(vIndex, "measurementLabel", t)
                            }
                          />
                        </View>
                      </View>

                      {/* MRP & Active */}
                      <View
                        style={[
                          styles.row,
                          { marginTop: 16, alignItems: "center" },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.label}>MRP (₹)</Text>
                          <TextInput
                            style={styles.input}
                            value={v.mrp}
                            onChangeText={(t) => updateVariantMRP(vIndex, t)}
                            keyboardType="numeric"
                            placeholder="599"
                          />
                        </View>
                        <View style={{ marginLeft: 16, alignItems: "center" }}>
                          <Text style={styles.label}>Active</Text>
                          <Switch
                            value={v.isActive}
                            onValueChange={(val) =>
                              updateVariantField(vIndex, "isActive", val)
                            }
                            trackColor={{ true: "#6366f1" }}
                          />
                        </View>
                      </View>

                      {/* Selling Prices */}
                      <View style={styles.pricingContainer}>
                        <Text style={styles.subLabel}>
                          Wholesale / Selling Prices
                        </Text>
                        {v.sellingPrices.map((p, pIndex) => (
                          <View key={pIndex} style={styles.priceRow}>
                            <View style={{ width: 60 }}>
                              <Text style={styles.tinyLabel}>Min Qty</Text>
                              <TextInput
                                style={styles.inputXs}
                                value={p.minQuantity}
                                keyboardType="numeric"
                                onChangeText={(t) =>
                                  updatePriceTierField(
                                    vIndex,
                                    pIndex,
                                    "minQuantity",
                                    t
                                  )
                                }
                              />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 8 }}>
                              <Text style={styles.tinyLabel}>Price (₹)</Text>
                              <TextInput
                                style={[
                                  styles.inputXs,
                                  { fontWeight: "bold", color: "#10b981" },
                                ]}
                                value={p.price}
                                keyboardType="numeric"
                                onChangeText={(t) =>
                                  updatePriceTierField(
                                    vIndex,
                                    pIndex,
                                    "price",
                                    t
                                  )
                                }
                              />
                            </View>
                            <View style={{ width: 60 }}>
                              <Text style={styles.tinyLabel}>Disc%</Text>
                              <View style={styles.readOnlyBadge}>
                                <Text style={styles.readOnlyText}>
                                  {p.discount}%
                                </Text>
                              </View>
                            </View>
                            {v.sellingPrices.length > 1 && (
                              <TouchableOpacity
                                onPress={() => removePriceTier(vIndex, pIndex)}
                                style={{ marginTop: 18 }}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={24}
                                  color="#ef4444"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                        <TouchableOpacity
                          onPress={() => addPriceTier(vIndex)}
                          style={styles.textLinkButton}
                        >
                          <Text style={styles.textLink}>+ Add Bulk Tier</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Variant Images */}
                      <View style={{ marginTop: 16 }}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.label}>Variant Images</Text>
                          <TouchableOpacity
                            onPress={() => pickVariantImages(vIndex)}
                          >
                            <Text style={styles.textLink}>+ Upload</Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ marginTop: 8 }}
                        >
                          {v.images.map((img, idx) => (
                            <View key={idx} style={styles.variantThumbBox}>
                              <Image
                                source={{ uri: img.uri }}
                                style={styles.variantThumb}
                              />
                              <TouchableOpacity
                                onPress={() => removeVariantImage(vIndex, idx)}
                                style={styles.removeThumbBtn}
                              >
                                <Ionicons
                                  name="close"
                                  size={12}
                                  color="white"
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {/* 4. Settings */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View
                    style={[styles.iconBox, { backgroundColor: "#dcfce7" }]}
                  >
                    <Text>⚙️</Text>
                  </View>
                  <Text style={styles.cardTitle}>Settings & Delivery</Text>
                </View>

                <View style={styles.settingRow}>
                  <View>
                    <Text style={styles.settingLabel}>Order Cancellation</Text>
                    <Text style={styles.settingSub}>
                      Can customers cancel orders?
                    </Text>
                  </View>
                  <Switch
                    value={deliveryCancel}
                    onValueChange={setDeliveryCancel}
                    trackColor={{ true: "#10b981" }}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <View>
                    <Text style={styles.settingLabel}>Returnable</Text>
                    <Text style={styles.settingSub}>
                      Is this product returnable?
                    </Text>
                  </View>
                  <Switch
                    value={deliveryReturnable}
                    onValueChange={setDeliveryReturnable}
                    trackColor={{ true: "#10b981" }}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <View>
                    <Text style={styles.settingLabel}>Global Visibility</Text>
                    <Text style={styles.settingSub}>
                      Show in app immediately?
                    </Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ true: "#6366f1" }}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#6366f1", "#4338ca"]}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {isLoading
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable
                onPress={() => setShowCategoryModal(false)}
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
                      selectedCategory?._id === item._id &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedCategory?._id === item._id &&
                          styles.categoryItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selectedCategory?._id === item._id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#6366f1"
                      />
                    )}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="folder-open-outline"
                  size={48}
                  color="#cbd5e1"
                />
                <Text style={styles.emptyStateText}>No categories found</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* SubCategory Modal */}
      <Modal
        visible={showSubCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select SubCategory</Text>
              <Pressable
                onPress={() => setShowSubCategoryModal(false)}
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
                      selectedSubCategory?._id === item._id &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedSubCategory(item);
                      setShowSubCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedSubCategory?._id === item._id &&
                          styles.categoryItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selectedSubCategory?._id === item._id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#6366f1"
                      />
                    )}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="albums-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>
                  No subcategories found
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a subcategory for this category first
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* SubSubCategory Modal */}
      <Modal
        visible={showSubSubCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubSubCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubSubCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sub-SubCategory</Text>
              <Pressable
                onPress={() => setShowSubSubCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            {subSubCategories && subSubCategories.length > 0 ? (
              <FlatList
                data={subSubCategories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.categoryItem,
                      pressed && styles.categoryItemPressed,
                      selectedSubSubCategory?._id === item._id &&
                        styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedSubSubCategory(item);
                      setShowSubSubCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedSubSubCategory?._id === item._id &&
                          styles.categoryItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selectedSubSubCategory?._id === item._id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#6366f1"
                      />
                    )}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="layers-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>
                  No sub-subcategories found
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a sub-subcategory for this subcategory first
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CreateProductScreen;

// ----- Styles -----

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: "row",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
  },
  thumbnailUploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    // overflow: "hidden",
  },
  fullWidthImageContainer: {
    width: "100%",
    height: "100%",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  editImageBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
  },
  addVariantButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addVariantButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  variantCard: {
    padding: 0,
    overflow: "hidden",
  },
  variantHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  variantHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  variantNumberBadge: {
    backgroundColor: "#6366f1",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  inactiveBadge: {
    backgroundColor: "#94a3b8",
  },
  variantNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  variantSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  variantBody: {
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  iconButton: {
    padding: 4,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
    marginTop: 8,
    textTransform: "uppercase",
  },
  measurementRow: {
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "flex-start",
    // flexWrap: "wrap",
    gap: 8,
  },
  inputSm: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#000",
    width: "100%",
  },
  measurementPickerWrapper: {
    flex: 1.2,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 40,
    justifyContent: "center",
  },
  pickerSm: {
    height: 50,
    color: "#000",
  },
  pricingContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tinyLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginBottom: 2,
  },
  inputXs: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    color: "#334155",
  },
  readOnlyBadge: {
    backgroundColor: "#dcfce7",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  readOnlyText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "bold",
  },
  textLinkButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  textLink: {
    color: "#6366f1",
    fontWeight: "600",
    fontSize: 13,
  },
  variantThumbBox: {
    marginRight: 10,
    position: "relative",
  },
  variantThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  removeThumbBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  settingSub: {
    fontSize: 12,
    color: "#94a3b8",
  },
  submitButton: {
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  flexOneMarginRight: {
    flex: 1,
    marginRight: 8,
  },
  flexOneMarginLeft: {
    flex: 1,
    marginLeft: 8,
  },
  // Category Selector Styles
  selectorButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  selectorPlaceholder: {
    color: "#94a3b8",
    fontWeight: "400",
  },
  selectorTextDisabled: {
    color: "#cbd5e1",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "70%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoryItemPressed: {
    backgroundColor: "#f1f5f9",
  },
  categoryItemSelected: {
    backgroundColor: "#e0e7ff",
  },
  categoryItemText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  categoryItemTextSelected: {
    color: "#6366f1",
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "center",
  },
});
