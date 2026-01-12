import React from "react";
import { View, StyleSheet, TextInput, TextInputProps, Pressable } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function FormInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  multiline,
  numberOfLines,
  ...props
}: FormInputProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const isMultiline = multiline === true;
  const minHeight = isMultiline ? (numberOfLines ? numberOfLines * 24 + 24 : 100) : Spacing.inputHeight;

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : colors.inputBorder,
            minHeight: minHeight,
            height: isMultiline ? "auto" : Spacing.inputHeight,
            alignItems: isMultiline ? "flex-start" : "center",
            paddingVertical: isMultiline ? Spacing.md : 0,
          },
        ]}
      >
        {icon ? (
          <Feather name={icon} size={20} color={colors.textSecondary} style={styles.icon} />
        ) : null}
        <TextInput
          style={[
            styles.input, 
            { color: theme.text },
            isMultiline && { textAlignVertical: "top", minHeight: minHeight - Spacing.md * 2 },
            style
          ]}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather name={rightIcon} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText type="small" style={[styles.error, { color: colors.error }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rightIcon: {
    padding: Spacing.sm,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
