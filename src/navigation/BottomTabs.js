import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import FavoriteScreen from "../screens/FavoriteScreen";
import CartScreen from "../screens/CartScreen"; // <-- import Cart
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DetailScreen from "../screens/DetailScreen";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0b0b0c",
          borderTopColor: "#1f1f1f",
          height: Platform.OS === "android" ? 65 : 80,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#7a7a7a",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "ellipse";
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Favorite")
            iconName = focused ? "heart" : "heart-outline";
          if (route.name === "Cart")
            iconName = focused ? "cart" : "cart-outline"; // <-- icon Cart
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{ title: "Favorites" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Cart" }}
      />
    </Tab.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}
