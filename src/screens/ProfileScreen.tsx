import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { CustomButton } from "../components/CustomButton";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch, persistor } from "../store";
import { logout } from "../store/authSlice";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useLogout } from "../hooks/useLogout";

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<RootNavigationProp>(); // RootStack navigation
  const { theme, isDark } = useTheme();
  const colors = Colors.light;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { mutate: logoutRequest, isPending: logoutLoading } = useLogout();

  const user = useSelector((state: RootState) => state.auth.user);

  // Logout button press
  const handleLogout = () => {
      setShowLogoutModal(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setShowLogoutModal(false);

    logoutRequest(undefined, {
      onSuccess: async () => {
        // Clear Redux user
        dispatch(logout());

        // Clear persisted storage
        await persistor.purge();

        // Navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      },
      onError: (err) => {
        console.log("Logout Error:", err);
        Alert.alert("Logout Failed", "Please try again.");
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText type="h1" style={{ color: "#fff" }}>
              {user?.first_name?.charAt(0).toUpperCase() || "T"}
            </ThemedText>
          </View>
          <ThemedText type="h2" style={styles.userName}>
            {user?.first_name + " " + user?.last_name || "Technician"}
          </ThemedText>
          <ThemedText type="body" style={{ color: colors.textSecondary }}>
            {user?.employeeId || "Employee"}
          </ThemedText>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Account Information
          </ThemedText>
          <Card elevation={1} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="user" size={20} color={colors.textSecondary} />
                <ThemedText
                  type="body"
                  style={[styles.infoLabelText, { color: colors.textSecondary }]}
                >
                  Name
                </ThemedText>
              </View>
              <ThemedText type="body">
                {user?.first_name + " " + user?.last_name || "-"}
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="hash" size={20} color={colors.textSecondary} />
                <ThemedText
                  type="body"
                  style={[styles.infoLabelText, { color: colors.textSecondary }]}
                >
                  Employee ID
                </ThemedText>
              </View>
              <ThemedText type="body">{user?.employee_id || "-"}</ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="phone" size={20} color={colors.textSecondary} />
                <ThemedText
                  type="body"
                  style={[styles.infoLabelText, { color: colors.textSecondary }]}
                >
                  Contact
                </ThemedText>
              </View>
              <ThemedText type="body">{user?.contact_no || "-"}</ThemedText>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Settings
          </ThemedText>

          <Card
            elevation={1}
            style={styles.menuItem}
            // onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.menuItemContent}>
              <View
                style={[styles.menuIcon, { backgroundColor: colors.primary + "20" }]}
              >
                <Feather name="edit-2" size={20} color={colors.primary} />
              </View>
              <ThemedText type="body">Edit Profile</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </Card>

          <Card
            elevation={1}
            style={styles.menuItem}
            // onPress={() => navigation.navigate("ChangePassword")}
          >
            <View style={styles.menuItemContent}>
              <View
                style={[styles.menuIcon, { backgroundColor: colors.warning + "20" }]}
              >
                <Feather name="lock" size={20} color={colors.warning} />
              </View>
              <ThemedText type="body">Change Password</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <CustomButton
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          >
            Logout
          </CustomButton>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            ELSS v1.0.0
          </ThemedText>
        </View>
      </ScrollView>

      {/* Logout modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Logout
            </ThemedText>
            <ThemedText type="body" style={styles.modalMessage}>
              Are you sure you want to logout?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={confirmLogout}
              >
                <ThemedText type="body" style={{ color: "#fff" }}>
                  Logout
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Styles same as your previous implementation
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  profileHeader: { alignItems: "center", marginBottom: Spacing["2xl"] },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  userName: { marginBottom: Spacing.xs },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },
  infoCard: { paddingVertical: Spacing.sm },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.md },
  infoLabel: { flexDirection: "row", alignItems: "center" },
  infoLabelText: { marginLeft: Spacing.md },
  divider: { height: 1 },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  menuItemContent: { flexDirection: "row", alignItems: "center" },
  menuIcon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  logoutButton: { marginTop: Spacing.md },
  footer: { alignItems: "center", marginTop: Spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", maxWidth: 320, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  modalTitle: { textAlign: "center", marginBottom: Spacing.md },
  modalMessage: { textAlign: "center", marginBottom: Spacing.xl },
  modalButtons: { flexDirection: "row", gap: Spacing.md },
  modalButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, alignItems: "center" },
});
