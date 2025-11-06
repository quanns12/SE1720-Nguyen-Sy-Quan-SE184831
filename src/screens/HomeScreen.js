import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const THEME = {
  bg: "#0E0E10",
  card: "#18181B",
  soft: "#222327",
  text: "#FFFFFF",
  subtext: "#A0A0A0",
  accent: "#00B4D8",
  muted: "#2A2A2A",
};

export default function HomeScreen({ navigation }) {
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(null);

  useEffect(() => {
    fetchShoes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    filterShoes();
  }, [shoes, selectedCategory, search, favorites]);

  const fetchShoes = async () => {
    try {
      setLoading(true);
      const res = await fetch(process.env.EXPO_PUBLIC_API_KEY);
      const data = await res.json();

      await AsyncStorage.setItem("shoes_cache", JSON.stringify(data));
      const sorted = [...data].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
      setShoes(sorted);

      const cats = [...new Set(data.map((item) => item.category))];
      setCategories(cats);
    } catch (err) {
      const cache = await AsyncStorage.getItem("shoes_cache");
      if (cache) setShoes(JSON.parse(cache));
      else setError("Không thể tải dữ liệu giày.");
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem("favorites");
    setFavorites(favs ? JSON.parse(favs) : []);
  };

  const toggleFavorite = async (shoe) => {
    let updated;
    if (favorites.some((f) => f.id === shoe.id))
      updated = favorites.filter((f) => f.id !== shoe.id);
    else updated = [...favorites, shoe];
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const filterShoes = () => {
    let list = shoes;
    if (selectedCategory !== "All")
      list = list.filter((s) => s.category === selectedCategory);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q)
      );
    }
    setFilteredShoes(list);
  };

  const handleSort = (type) => {
    setSortBy(type);
    let sorted = [...filteredShoes];
    if (type === "price") sorted.sort((a, b) => a.price - b.price);
    if (type === "rating")
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredShoes(sorted);
  };

  const renderShoeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { shoe: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.shoeUrl }} style={styles.image} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            <Ionicons
              name={isFavorite(item.id) ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite(item.id) ? "#E50914" : THEME.subtext} // đỏ Netflix
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <SafeAreaView style={styles.safeCenter}>
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.subtext, marginTop: 8 }}>
          Loading shoes...
        </Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filteredShoes}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderShoeCard}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>The Sneakers</Text>

            {/* Search */}
            <View style={styles.searchRow}>
              <Ionicons
                name="search"
                size={20}
                color={THEME.subtext}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Search shoes or brand..."
                placeholderTextColor={THEME.subtext}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Category filter */}
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedCategory === "All" && styles.chipActive,
                ]}
                onPress={() => setSelectedCategory("All")}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === "All" && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    selectedCategory === c && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === c && styles.chipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort row */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity onPress={() => handleSort("price")}>
                <Text
                  style={[
                    styles.sortOption,
                    sortBy === "price" && styles.sortActive,
                  ]}
                >
                  Price
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSort("rating")}>
                <Text
                  style={[
                    styles.sortOption,
                    sortBy === "rating" && styles.sortActive,
                  ]}
                >
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={40} color={THEME.subtext} />
            <Text style={{ color: THEME.subtext }}>No shoes found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  safeCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.bg,
  },
  title: {
    color: THEME.text,
    fontSize: 30,
    fontWeight: "800",
    margin: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.soft,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: THEME.text },
  categoryRow: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 16,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.muted,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: THEME.accent },
  chipText: { color: THEME.subtext },
  chipTextActive: { color: THEME.bg, fontWeight: "600" },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sortLabel: { color: THEME.subtext, marginRight: 10 },
  sortOption: {
    color: THEME.text,
    marginRight: 14,
    fontWeight: "500",
  },
  sortActive: { color: THEME.accent },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    marginBottom: 16,
    width: "48%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardBody: { padding: 10 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: THEME.text, fontSize: 14, fontWeight: "700", flex: 1 },
  brand: { color: THEME.subtext, fontSize: 12, marginTop: 2 },
  price: {
    color: THEME.text, // từ THEME.accent → THEME.text
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  empty: { alignItems: "center", marginTop: 40 },
});
