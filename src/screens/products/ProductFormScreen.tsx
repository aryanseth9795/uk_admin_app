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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useCreateAdminProduct } from "../../api/hooks/useAdmin";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

// ----- enums as string arrays (must match backend values) -----

const CATEGORY_OPTIONS = [
  "beauty",
  "cosmetics",
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

// subset of subSubCategory (extend if you want all)
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

// common units for measurement
const MEASUREMENT_UNITS = ["", "ml", "L", "g", "kg", "pcs"] as const;

// ----- local types -----

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
  // NEW: measurement fields for each variant
  measurementValue: string; // e.g. "200"
  measurementUnit: string; // "ml", "L", "g", "kg", "pcs"
  measurementLabel: string; // e.g. "200 ml", "Shade 01"
  mrp: string;
  stock: string;
  isActive: boolean;
  sellingPrices: PriceTierForm[];
  images: AssetLike[];
};

const CreateProductScreen: React.FC = () => {
  const navigation = useNavigation();
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
      packOf: "",
      measurementValue: "",
      measurementUnit: "",
      measurementLabel: "",
      mrp: "",
      stock: "",
      isActive: true,
      sellingPrices: [{ minQuantity: "1", price: "", discount: "0" }],
      images: [],
    },
  ]);

  const {
    mutateAsync,
    isPending: isLoading,
    isError,
    error,
  } = useCreateAdminProduct();

  // ----- helpers -----

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
    const ok = await askImagePermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ⬅️ changed
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setThumbnail({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
    }
  };

  const pickVariantImages = async (vIndex: number) => {
    const ok = await askImagePermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVariants((prev) => {
        const copy = [...prev];
        const oldImages = copy[vIndex].images || [];
        const newImages: AssetLike[] = result.assets.map((a) => ({
          uri: a.uri,
          fileName: a.fileName ?? undefined,
          mimeType: a.mimeType ?? undefined,
        }));
        copy[vIndex].images = [...oldImages, ...newImages];
        return copy;
      });
    }
  };

  const updateVariantField = (
    idx: number,
    key: keyof VariantForm,
    value: string | boolean
  ) => {
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
      tiers[pIndex] = { ...tiers[pIndex], [key]: value };
      copy[vIndex].sellingPrices = tiers;
      return copy;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        packOf: "",
        measurementValue: "",
        measurementUnit: "",
        measurementLabel: "",
        mrp: "",
        stock: "",
        isActive: true,
        sellingPrices: [{ minQuantity: "1", price: "", discount: "0" }],
        images: [],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addPriceTier = (vIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].sellingPrices = [
        ...copy[vIndex].sellingPrices,
        { minQuantity: "1", price: "", discount: "0" },
      ];
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

  // ----- submit using .mutate -----

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Product name is required.");
      return;
    }
    if (!brand.trim()) {
      Alert.alert("Error", "Product Brand is required.");
      return;
    }
    if (!slug.trim()) {
      Alert.alert("Error", "Slug is required.");
      return;
    }
    if (!thumbnail) {
      Alert.alert("Error", "Please select a thumbnail image.");
      return;
    }
    if (!variants.length) {
      Alert.alert("Error", "At least one variant is required.");
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
          v.measurementValue.trim() ||
          v.measurementUnit.trim() ||
          v.measurementLabel.trim();

        const measurement = hasMeasurement
          ? {
              value: v.measurementValue
                ? Number(v.measurementValue)
                : undefined,
              unit: v.measurementUnit || undefined,
              label: v.measurementLabel || undefined,
            }
          : undefined;

        return {
          packOf: Number(v.packOf || 0),
          measurement,
          mrp: Number(v.mrp || 0),
          stock: Number(v.stock || 0),
          isActive: v.isActive,
          images: [], // will be filled server-side from uploaded files
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

    formData.append("thumbnail", {
      uri: thumbnail.uri,
      name: thumbnail.fileName || "thumbnail.jpg",
      type: thumbnail.mimeType || "image/jpeg",
    } as any);

    variants.forEach((v, vIndex) => {
      v.images.forEach((img, imgIndex) => {
        formData.append(`variantImages[${vIndex}]`, {
          uri: img.uri,
          name: img.fileName || `variant-${vIndex}-${imgIndex}.jpg`,
          type: img.mimeType || "image/jpeg",
        } as any);
      });
    });

    const res: { message: string; products: object } = await mutateAsync({
      formData,
    });

    Toast.show({ type: "success", text1: res?.message });
    navigation.goBack();
  };

  // ----- UI -----

  useEffect(() => {
    if (isError) {
      Toast.show({ type: "error", text1: String(error) });
    }
  }, [isError]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Create Product</Text>
      <Text style={styles.subtitle}>Beauty • Cosmetics • General • Gifts</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lakme"
          placeholderTextColor="#9ca3af"
          value={brand}
          onChangeText={(t) => setBrand(t)}
        />
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Hydrating Face Wash"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (!slug) {
              setSlug(
                t
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
              );
            }
          }}
        />

        <Text style={styles.label}>Slug</Text>
        <TextInput
          style={styles.input}
          placeholder="hydrating-face-wash"
          placeholderTextColor="#9ca3af"
          value={slug}
          onChangeText={setSlug}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(value: any) => setCategory(value.toString())}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <Picker.Item
                key={c}
                label={c.replace(/_/g, " ").toUpperCase()}
                value={c}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Sub Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={subCategory}
            onValueChange={(value: any) => setSubCategory(value?.toString())}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            <Picker.Item label="Select..." value={undefined} />
            {SUBCATEGORY_OPTIONS.map((c) => (
              <Picker.Item
                key={c}
                label={c.replace(/_/g, " ").toUpperCase()}
                value={c}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Sub Sub Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={subSubCategory}
            onValueChange={(value: any) => setSubSubCategory(value?.toString())}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            <Picker.Item label="Select..." value={undefined} />
            {SUBSUBCATEGORY_OPTIONS.map((c) => (
              <Picker.Item
                key={c}
                label={c.replace(/_/g, " ").toUpperCase()}
                value={c}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="facewash, dry-skin, gentle"
          placeholderTextColor="#9ca3af"
          value={tagsInput}
          onChangeText={setTagsInput}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          placeholder="Short description..."
          placeholderTextColor="#9ca3af"
          value={description}
          multiline
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thumbnail</Text>
        <TouchableOpacity
          style={styles.thumbnailButton}
          onPress={pickThumbnail}
        >
          <Text style={styles.thumbnailButtonText}>
            {thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
          </Text>
        </TouchableOpacity>

        {thumbnail && (
          <Image
            source={{ uri: thumbnail.uri }}
            style={styles.thumbnailPreview}
          />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Variants</Text>
          <TouchableOpacity onPress={addVariant}>
            <Text style={styles.addLink}>+ Add Variant</Text>
          </TouchableOpacity>
        </View>

        {variants.map((v, vIndex) => (
          <View key={vIndex} style={styles.variantCard}>
            <View style={styles.variantHeaderRow}>
              <Text style={styles.variantTitle}>Variant #{vIndex + 1}</Text>
              {variants.length > 1 && (
                <TouchableOpacity onPress={() => removeVariant(vIndex)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Pack Of</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={v.packOf}
              onChangeText={(t) => updateVariantField(vIndex, "packOf", t)}
              placeholder="e.g. 1, 2, 3..."
              placeholderTextColor="#9ca3af"
            />

            {/* NEW: measurement section */}
            <Text style={[styles.label, { marginTop: 10 }]}>
              Measurement (optional)
            </Text>
            <View style={styles.measurementRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.smallLabel}>Value</Text>
                <TextInput
                  style={styles.inputSm}
                  keyboardType="numeric"
                  value={v.measurementValue}
                  onChangeText={(t) =>
                    updateVariantField(vIndex, "measurementValue", t)
                  }
                  placeholder="e.g. 200"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={{ flex: 1, marginRight: 0.5 }}>
                <Text style={styles.smallLabel}>Unit</Text>
                <View style={styles.pickerWrapperSm}>
                 
                  <Picker
                    selectedValue={v.measurementUnit}
                    onValueChange={(val: string) =>
                      updateVariantField(
                        vIndex,
                        "measurementUnit",
                        val?.toString()
                      )
                    }
                    style={styles.pickerSm}
                    dropdownIconColor="#6b7280"
                  >
                    {MEASUREMENT_UNITS.map((u) => (
                      <Picker.Item
                        key={u || "none"}
                        label={u || "Select"}
                        value={u}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

            </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Label</Text>
                <TextInput
                  style={styles.inputSm}
                  value={v.measurementLabel}
                  onChangeText={(t) =>
                    updateVariantField(vIndex, "measurementLabel", t)
                  }
                  placeholder="e.g. 200 ml, Shade 01"
                  placeholderTextColor="#9ca3af"
                />
              </View>

            <Text style={styles.label}>MRP</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={v.mrp}
              onChangeText={(t) => updateVariantField(vIndex, "mrp", t)}
              placeholder="e.g. 299"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={v.stock}
              onChangeText={(t) => updateVariantField(vIndex, "stock", t)}
              placeholder="e.g. 50"
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={v.isActive}
                onValueChange={(val) =>
                  updateVariantField(vIndex, "isActive", val)
                }
                trackColor={{ false: "#d1d5db", true: "#22c55e" }}
                thumbColor="#ffffff"
              />
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>
              Selling Prices
            </Text>
            {v.sellingPrices.map((p, pIndex) => (
              <View key={pIndex} style={styles.priceRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.smallLabel}>Min Qty</Text>
                  <TextInput
                    style={styles.inputSm}
                    keyboardType="numeric"
                    value={p.minQuantity}
                    onChangeText={(t) =>
                      updatePriceTierField(vIndex, pIndex, "minQuantity", t)
                    }
                    placeholder="1"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.smallLabel}>Price</Text>
                  <TextInput
                    style={styles.inputSm}
                    keyboardType="numeric"
                    value={p.price}
                    onChangeText={(t) =>
                      updatePriceTierField(vIndex, pIndex, "price", t)
                    }
                    placeholder="249"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.smallLabel}>Discount %</Text>
                  <TextInput
                    style={styles.inputSm}
                    keyboardType="numeric"
                    value={p.discount}
                    onChangeText={(t) =>
                      updatePriceTierField(vIndex, pIndex, "discount", t)
                    }
                    placeholder="10"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {v.sellingPrices.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removePriceTier(vIndex, pIndex)}
                    style={{ marginLeft: 4, marginTop: 20 }}
                  >
                    <Text style={styles.removeText}>X</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={() => addPriceTier(vIndex)}
              style={styles.smallButton}
            >
              <Text style={styles.smallButtonText}>+ Add Price Tier</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 12 }]}>Images</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => pickVariantImages(vIndex)}
            >
              <Text style={styles.smallButtonText}>Upload Variant Images</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
            >
              {v.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img.uri }}
                  style={styles.variantImage}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Options</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Can Cancel</Text>
          <Switch
            value={deliveryCancel}
            onValueChange={setDeliveryCancel}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Returnable</Text>
          <Switch
            value={deliveryReturnable}
            onValueChange={setDeliveryReturnable}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.label}>Warranty</Text>
          <Switch
            value={deliveryWarranty}
            onValueChange={setDeliveryWarranty}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Product Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? "Creating..." : "Create Product"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateProductScreen;

// ----- styles -----

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  picker: {
    color: "#111827",
    height: 52,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  thumbnailButton: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  thumbnailButtonText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 14,
  },
  thumbnailPreview: {
    marginTop: 10,
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addLink: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },
  variantCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  variantHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  variantTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  removeText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  smallLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  inputSm: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 13,
  },
  smallButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  smallButtonText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "500",
  },
  variantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  submitButton: {
    marginTop: 4,
    marginBottom: 24,
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#064e3b",
    fontSize: 16,
    fontWeight: "700",
  },
  measurementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  pickerWrapperSm: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    // textAlign:"center",
    // color:"black",
    height:35,
    display:"flex",
    justifyContent:"center",
    // alignItems:"baseline"
  },
  pickerSm: {
    color: "#111827",
    marginTop:0
    // height: 30,
  },
});
