import React from "react";
import { CustomButton } from "../components/CustomButton";
import { ThemedText } from "./ThemedText";

import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/theme";

type AlertType = "success" | "error" | "info";

type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  type?: AlertType;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const CustomAlert = ({
  visible,
  title,
  message,
  type = "info",
  loading = false,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: CustomAlertProps) => {
  const getColor = () => {
    switch (type) {
      case "success":
        return "#2E7D32";
      case "error":
        return "#D32F2F";
      default:
        return "#1976D2";
    }
  };

  const colors = Colors.light;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title && <ThemedText style={styles.title} type="h4">{title}</ThemedText>}
          {message && <ThemedText style={styles.message} type="body">{message}</ThemedText>}

          {loading ? (
            <ActivityIndicator size="large" color={getColor()} />
          ) : (
            <View style={styles.actions}>
              {type === "info" && (
                <CustomButton onPress={onCancel} style={[ { backgroundColor: colors.primary, paddingHorizontal: 10 }]}>{cancelText}</CustomButton>
              )}
              <CustomButton onPress={onConfirm} style={[ { backgroundColor: colors.secondary, paddingHorizontal: 10 }]}> {confirmText || (type === "info" ? "Confirm" : "OK")}</CustomButton>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 20,
    color: "#444",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5
  }
});
