import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface DropdownOption {
  id: string;
  name: string;
}

interface FormDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  error?: string;
  readOnly?: boolean;
}

export function FormDropdown({
  label,
  placeholder = "Select an option",
  options,
  selectedValue,
  onValueChange,
  error,
  readOnly = false,
}: FormDropdownProps) {
  const { theme } = useTheme();
  const colors = Colors.light;
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const selectedOption = options.find((opt) => opt.id === selectedValue);

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable
        style={[
          styles.dropdown,
          {
            backgroundColor: readOnly
              ? colors.backgroundSecondary
              : colors.inputBackground,
            borderColor: error ? colors.error : colors.inputBorder,
            opacity: readOnly ? 0.6 : 1,
          },
        ]}
        onPress={() => {
          if (!readOnly) {
            setIsOpen(true);
          }
        }}
      >
        <ThemedText
          type="body"
          style={[
            styles.selectedText,
            { color: selectedOption ? theme.text : colors.textSecondary },
          ]}
        >
          {selectedOption?.name || placeholder}
        </ThemedText>
        {!readOnly && (
          <Feather name="chevron-down" size={20} color={colors.textSecondary} />
        )}
      </Pressable>
      {error ? (
        <ThemedText type="small" style={[styles.error, { color: colors.error }]}>
          {error}
        </ThemedText>
      ) : null}

      <Modal visible={isOpen} animationType="slide" transparent>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            if (readOnly) return;
            setIsOpen(false);
          }}
        >
          <Pressable 
            style={[
              styles.modalContent,
              { 
                backgroundColor: colors.backgroundDefault,
                // paddingBottom: insets.bottom + Spacing.lg,
              }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h4" style={{ color: colors.text }}>{label}</ThemedText>
              <Pressable 
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        item.id === selectedValue ? colors.primary + "20" : "transparent",
                    },
                  ]}
                  onPress={() => {
                    onValueChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <ThemedText
                    type="body"
                    style={{
                      color: item.id === selectedValue ? colors.primary : colors.text,
                    }}
                  >
                    {item.name}
                  </ThemedText>
                  {item.id === selectedValue ? (
                    <Feather name="check" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: colors.divider }]} />
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  selectedText: {
    flex: 1,
  },
  error: {
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 50,
  },
  separator: {
    height: 1,
  },
});
