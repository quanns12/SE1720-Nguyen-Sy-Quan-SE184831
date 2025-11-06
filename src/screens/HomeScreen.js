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
  bg: "#0b0b0c",
  card: "#121212",
  soft: "#1f1f1f",
  text: "#FFFFFF",
  subtext: "#B3B3B3",
  accent: "#E50914",
  muted: "#2a2a2a",
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

  const renderShoeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { shoe: item })}
    >
      <Image source={{ uri: item.shoeUrl }} style={styles.image} />
      <View style={{ flex: 1, padding: 10 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            <Ionicons
              name={isFavorite(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite(item.id) ? THEME.accent : THEME.subtext}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
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
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Sneakers</Text>
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
  title: { color: THEME.text, fontSize: 30, fontWeight: "800", margin: 16 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.soft,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
  },
  searchInput: { flex: 1, color: THEME.text },
  categoryRow: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.muted,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: THEME.accent },
  chipText: { color: THEME.subtext },
  chipTextActive: { color: THEME.bg },
  card: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: 120, height: 120 },
  name: { color: THEME.text, fontSize: 16, fontWeight: "700", flex: 1 },
  brand: { color: THEME.subtext, marginTop: 4 },
  price: { color: THEME.accent, fontSize: 15, fontWeight: "700", marginTop: 4 },
  category: { color: THEME.subtext, fontSize: 13, marginTop: 4 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  empty: { alignItems: "center", marginTop: 40 },
});
