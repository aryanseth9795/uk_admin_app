import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useCreateAdminProduct } from "../../api/hooks/useAdmin";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ----- Constants & Enums -----

const CATEGORY_OPTIONS = [
  "beauty & cosmetics",
  "general_store",
  "gifts",
] as const;

const SUBCATEGORY_OPTIONS = [
  "beauty_skincare",
  "beauty_haircare",
  "beauty_bath_body",
  "beauty_fragrances",
  "beauty_men_grooming",
  "beauty_tools_accessories",
  "cosmetics_face",
  "cosmetics_eyes",
  "cosmetics_lips",
  "cosmetics_nails",
  "cosmetics_kits_combos",
  "general_groceries",
  "general_household_supplies",
  "general_home_cleaning",
  "general_paper_disposables",
  "general_pooja_items",
  "general_stationery",
  "general_pet_care",
  "general_baby_care",
  "general_snacks_beverages",
  "general_dairy_bakery",
  "gifts_soft_toys",
  "gifts_chocolates_sweets",
  "gifts_flowers_plants",
  "gifts_decor_showpieces",
  "gifts_greeting_cards",
  "gifts_mugs_bottles",
  "gifts_photo_frames",
  "gifts_hampers",
  "gifts_festive_gifts",
] as const;

const SUBSUBCATEGORY_OPTIONS = [
  "face_wash",
  "moisturizer",
  "face_serum",
  "sunscreen",
  "shampoo",
  "conditioner",
  "body_wash",
  "soap",
  "foundation",
  "compact",
  "lipstick",
  "kajal",
  "eyeliner",
  "nail_polish",
  "rice",
  "atta",
  "pulses",
  "namkeen",
  "biscuits",
  "chips",
  "floor_cleaner",
  "toilet_cleaner",
  "tissue",
  "napkin",
  "notebook",
  "pen",
  "agarbatti",
  "diya",
  "teddy_bear",
  "soft_toy",
  "chocolate_box",
  "photo_frame",
  "greeting_card",
  "custom_mug",
] as const;

const MEASUREMENT_UNITS = ["", "ml", "L", "g", "kg", "pcs"] as const;

// ----- Types -----

type AssetLike = {
  uri: string;
  fileName?: string;
  mimeType?: string;
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

const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation();

  // ----- State -----
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>("beauty");
  const [subCategory, setSubCategory] = useState<string | undefined>();
  const [subSubCategory, setSubSubCategory] = useState<string | undefined>();
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

  const {
    mutateAsync,
    isPending: isLoading,
    isError,
    error,
  } = useCreateAdminProduct();

  useEffect(() => {
    if (isError) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: String(error),
      });
    }
  }, [isError, error]);

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
      Alert.alert("Permission needed", "Allow gallery access to upload images.");
      return false;
    }
    return true;
  };

  const pickThumbnail = async () => {
    if (!(await askImagePermission())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // ✅ latest format
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
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
        mediaTypes: ["images"], // ✅ latest format
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

  const updateVariantField = (idx: number, key: keyof VariantForm, value: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      (copy[idx] as any)[key] = value;
      return copy;
    });
  };

  const updatePriceTierField = (
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
  };

  const updateVariantMRP = (vIndex: number, mrpValue: string) => {
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
  };

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
      copy[vIndex].images = copy[vIndex].images.filter(
        (_, i) => i !== imgIndex
      );
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim() || !slug.trim()) {
      Alert.alert("Missing Fields", "Please fill in Brand, Name, and Slug.");
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

    const productPayload = {
      name,
      brand,
      slug,
      category,
      subCategory,
      subSubCategory,
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

    const formData = new FormData();
    formData.append("data", JSON.stringify(productPayload));

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

    variants.forEach((v, vIndex) => {
      v.images.forEach((img, imgIndex) => {
        const vImgUri =
          Platform.OS === "android"
            ? img.uri
            : img.uri.replace("file://", "");
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

    const res: any = await mutateAsync({ formData });
    Toast.show({
      type: "success",
      text1: res?.message || "Product Created!",
    });
    // @ts-ignore
    navigation.goBack();
  };

  // ----- UI Components -----

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    keyboardType = "default",
    style,
  }: any) => (
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
  );

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
              <Text style={styles.headerTitle}>Add New Product</Text>
              <Text style={styles.headerSubtitle}>
                URS Shop
              </Text>
            </View>
          </LinearGradient>

          {/* 1. General Info */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: "#e0e7ff" }]}>
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
              onChange={(t: string) => {
                setName(t);
                if (!slug)
                  setSlug(
                    t
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                  );
              }}
              placeholder="e.g. 9to5 Lipstick"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Slug (URL)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: "#f1f5f9", color: "#64748b" },
                ]}
                value={slug}
                onChangeText={setSlug}
                placeholder="product-url-slug"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#6366f1"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <Picker.Item
                        key={c}
                        label={c.replace(/_/g, " ").toUpperCase()}
                        value={c}
                        color="#000"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Sub-Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={subCategory}
                    onValueChange={(itemValue) => setSubCategory(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#6366f1"
                  >
                    <Picker.Item
                      label="Select..."
                      value={undefined}
                      color="#94a3b8"
                    />
                    {SUBCATEGORY_OPTIONS.map((c) => (
                      <Picker.Item
                        key={c}
                        label={c.replace("beauty_", "").replace(/_/g, " ")}
                        value={c}
                        color="#000"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specific Type (Optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={subSubCategory}
                  onValueChange={(val) => setSubSubCategory(val)}
                  style={styles.picker}
                  dropdownIconColor="#6366f1"
                >
                  <Picker.Item
                    label="Select Specific Type..."
                    value={undefined}
                    color="#94a3b8"
                  />
                  {SUBSUBCATEGORY_OPTIONS.map((c) => (
                    <Picker.Item
                      key={c}
                      label={c.replace(/_/g, " ")}
                      value={c}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
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
              <View style={[styles.iconBox, { backgroundColor: "#fce7f3" }]}>
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
                      style={{ flex: 1, marginRight: 8 }}
                      keyboardType="numeric"
                      placeholder="1"
                    />
                    <InputField
                      label="Stock"
                      value={v.stock}
                      onChange={(t: string) =>
                        updateVariantField(vIndex, "stock", t)
                      }
                      style={{ flex: 1, marginLeft: 8 }}
                      keyboardType="numeric"
                      placeholder="100"
                    />
                  </View>

                  {/* Measurement */}
                  <Text style={styles.subLabel}>Measurement</Text>
                  <View style={styles.measurementRow}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={styles.inputSm}
                        placeholder="Value (200)"
                        keyboardType="numeric"
                        value={v.measurementValue}
                        onChangeText={(t) =>
                          updateVariantField(vIndex, "measurementValue", t)
                        }
                      />
                    </View>

                    <View style={styles.measurementPickerWrapper}>
                      <Picker
                        selectedValue={v.measurementUnit}
                        onValueChange={(val) =>
                          updateVariantField(vIndex, "measurementUnit", val)
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

                    <View style={{ flex: 2 }}>
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
                              {
                                fontWeight: "bold",
                                color: "#10b981",
                              },
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
                            onPress={() =>
                              removePriceTier(vIndex, pIndex)
                            }
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
                            onPress={() =>
                              removeVariantImage(vIndex, idx)
                            }
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
              <View style={[styles.iconBox, { backgroundColor: "#dcfce7" }]}>
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
                {isLoading ? "Saving..." : "Create Product"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    overflow: "hidden",
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
    // alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  inputSm: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#000",
  },
  measurementPickerWrapper: {
    flex: 1.2,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 50,
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
    right: -6,
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
});
