import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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
};

export default function FavoriteScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem("favorites");
    setFavorites(favs ? JSON.parse(favs) : []);
  };

  const removeFavorite = async (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const renderFavorite = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { shoe: item })}
      onLongPress={() => removeFavorite(item.id)}
    >
      <Image source={{ uri: item.shoeUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart" size={20} color={THEME.accent} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Your Favorites</Text>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderFavorite}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={50} color={THEME.subtext} />
          <Text style={styles.emptyText}>No favorites yet.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.goHomeBtn}
          >
            <Text style={styles.goHomeText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  title: {
    color: THEME.text,
    fontSize: 24,
    fontWeight: "800",
    margin: 16,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    flex: 0.48,
    position: "relative",
  },
  image: { width: "100%", height: 140 },
  info: { padding: 10 },
  name: { color: THEME.text, fontWeight: "700", fontSize: 14 },
  price: { color: "#FFFFFF", fontWeight: "600", marginTop: 4 },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: THEME.soft,
    padding: 6,
    borderRadius: 50,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: THEME.subtext, marginTop: 10 },
  goHomeBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  goHomeText: { color: "#fff", fontWeight: "600" },
});
