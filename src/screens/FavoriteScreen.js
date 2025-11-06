import React, { useEffect, useState } from "react";
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
  muted: "#2a2a2a",
};

export default function FavoriteScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
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
    >
      <Image source={{ uri: item.shoeUrl }} style={styles.image} />
      <View style={{ flex: 1, padding: 10 }}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeFavorite(item.id)}>
            <Ionicons name="trash-outline" size={20} color={THEME.subtext} />
          </TouchableOpacity>
        </View>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={favorites}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderFavorite}
        ListHeaderComponent={<Text style={styles.title}>Your Favorites</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={40} color={THEME.subtext} />
            <Text style={{ color: THEME.subtext, marginTop: 8 }}>
              No favorites yet.
            </Text>
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
  title: {
    color: THEME.text,
    fontSize: 26,
    fontWeight: "800",
    margin: 16,
  },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  empty: { alignItems: "center", marginTop: 40 },
});
