import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  bg: "#0b0b0c",
  card: "#121212",
  soft: "#1f1f1f",
  text: "#FFFFFF",
  subtext: "#B3B3B3",
  accent: "#E50914",
  muted: "#2a2a2a",
};

export default function DetailScreen({ route, navigation }) {
  const { shoe } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, []);

  const checkFavorite = async () => {
    const favs = await AsyncStorage.getItem("favorites");
    if (favs) {
      const parsed = JSON.parse(favs);
      setIsFavorite(parsed.some((f) => f.id === shoe.id));
    }
  };

  const toggleFavorite = async () => {
    const favs = await AsyncStorage.getItem("favorites");
    let parsed = favs ? JSON.parse(favs) : [];
    let updated;
    if (isFavorite) {
      updated = parsed.filter((f) => f.id !== shoe.id);
    } else {
      updated = [...parsed, shoe];
    }
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: shoe.shoeUrl }} style={styles.image} />

        <View style={styles.headerRow}>
          <Text style={styles.name}>{shoe.name}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? THEME.accent : THEME.subtext}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.brand}>{shoe.brand}</Text>
        <Text style={styles.category}>Category: {shoe.category}</Text>
        <Text style={styles.price}>${shoe.price}</Text>
        <Text style={styles.rating}>⭐ {shoe.rating}/100</Text>
        <Text style={styles.availability}>
          {shoe.isAvailable ? "In Stock" : "Out of Stock"}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{shoe.description}</Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: THEME.accent }]}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart-dislike" : "heart"}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.btnText}>
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
    marginRight: 10,
  },
  brand: {
    color: THEME.subtext,
    fontSize: 16,
    marginTop: 4,
  },
  category: {
    color: THEME.subtext,
    fontSize: 14,
    marginTop: 4,
  },
  price: {
    color: THEME.accent,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  rating: {
    color: THEME.text,
    marginTop: 4,
  },
  availability: {
    color: THEME.subtext,
    marginVertical: 6,
  },
  sectionTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  description: {
    color: THEME.subtext,
    marginTop: 8,
    lineHeight: 22,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
