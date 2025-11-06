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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  bg: "#0E0E10",
  card: "#18181B",
  soft: "#1F1F23",
  text: "#FFFFFF",
  subtext: "#A3A3A3",
  accent: "#00B4D8", // xanh dương nhạt
  heart: "#E50914", // đỏ Netflix
};

export default function DetailScreen({ route }) {
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

  const addToCart = async () => {
    const cart = await AsyncStorage.getItem("cart");
    let parsed = cart ? JSON.parse(cart) : [];

    if (parsed.some((item) => item.id === shoe.id)) {
      Alert.alert("Cart", "This shoe is already in your cart.");
      return;
    }

    parsed.push({ ...shoe, quantity: 1 });
    await AsyncStorage.setItem("cart", JSON.stringify(parsed));
    Alert.alert("Cart", "Added to cart successfully!");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: shoe.shoeUrl }} style={styles.image} />

        <View style={styles.infoCard}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{shoe.name}</Text>
            <TouchableOpacity onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={26}
                color={isFavorite ? THEME.heart : THEME.subtext}
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

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: THEME.heart }]}
              onPress={toggleFavorite}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? "heart-dislike" : "heart"}
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.btnText}>
                {isFavorite ? "Remove Favorite" : "Add to Favorite"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: THEME.accent }]}
              onPress={addToCart}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cart"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.btnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 18,
    resizeMode: "cover",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  infoCard: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
    marginTop: 2,
  },
  category: {
    color: THEME.subtext,
    fontSize: 14,
    marginTop: 2,
  },
  price: {
    color: THEME.text,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
