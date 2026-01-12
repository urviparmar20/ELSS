import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaintenanceStackNavigator from "../navigation/MaintenanceStackNavigator";
import ReportsStackNavigator from "../navigation/ReportsStackNavigator";
import ProfileStackNavigator from "../navigation/ProfileStackNavigator";
import { useTheme } from "../hooks/useTheme";
import { Colors } from "../constants/theme";

export type MainTabParamList = {
  MaintenanceTab: undefined;
  ReportsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = 60 + Math.max(insets.bottom, 16);

  return (
    <Tab.Navigator
      initialRouteName="MaintenanceTab"
      screenOptions={{
        tabBarActiveTintColor: isDark ? Colors.dark.primary : Colors.light.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundDefault,
          }),
          borderTopWidth: 0,
          elevation: 8,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="MaintenanceTab"
        component={MaintenanceStackNavigator}
        options={{
          title: "Maintenance",
          tabBarIcon: ({ color, size }) => (
            <Feather name="tool" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsStackNavigator}
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
