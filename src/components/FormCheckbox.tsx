import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FormCheckbox({ label, checked, onChange }: FormCheckboxProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable style={styles.container} onPress={() => onChange(!checked)}>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? colors.primary : "transparent",
            borderColor: checked ? colors.primary : colors.inputBorder,
          },
        ]}
      >
        {checked ? <Feather name="check" size={16} color="#fff" /> : null}
      </View>
      <ThemedText type="body" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  label: {},
});
