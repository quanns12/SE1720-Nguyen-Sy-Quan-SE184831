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
  Alert,
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

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    const data = await AsyncStorage.getItem("cart");
    setCart(data ? JSON.parse(data) : []);
  };

  const removeItem = async (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    await AsyncStorage.setItem("cart", JSON.stringify(updated));
  };

  const increaseQty = async (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updated);
    await AsyncStorage.setItem("cart", JSON.stringify(updated));
  };

  const decreaseQty = async (id) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
      .filter((i) => i.quantity > 0);
    setCart(updated);
    await AsyncStorage.setItem("cart", JSON.stringify(updated));
  };

  const getTotal = () => {
    return cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.shoeUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => decreaseQty(item.id)}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={16} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQty(item.id)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={16} color={THEME.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={THEME.subtext} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Your Cart</Text>

      {cart.length > 0 ? (
        <>
          <FlatList
            data={cart}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderCartItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ${getTotal()}</Text>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                Alert.alert("Checkout", "Proceeding to payment...")
              }
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={50} color={THEME.subtext} />
          <Text style={styles.emptyText}>Your cart is empty.</Text>
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
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    backgroundColor: THEME.soft,
    padding: 6,
    borderRadius: 6,
  },
  qtyText: { color: THEME.text, marginHorizontal: 8, fontWeight: "700" },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: THEME.soft,
    padding: 6,
    borderRadius: 50,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  totalText: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  checkoutBtn: {
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
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
