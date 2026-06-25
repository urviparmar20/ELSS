import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, Modal, TextInput } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ThemedText } from "../components/ThemedText";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface FormDatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function FormDatePicker({ label, value, onChange, placeholder = "Select date", readOnly = false, }: FormDatePickerProps) {
  const [show, setShow] = useState(false);
  const colors = Colors.light;

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return placeholder;
    const date = parseDate(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate && event.type === "set") {
      onChange(formatDate(selectedDate));
    }
  };

  const handleConfirm = () => {
    setShow(false);
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {label ? <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText> : null}
        <Pressable
          style={[
            styles.inputContainer,
            {
              backgroundColor: readOnly
                ? colors.backgroundSecondary
                : colors.inputBackground,
              borderColor: colors.inputBorder,
              opacity: readOnly ? 0.6 : 1,
            },
          ]}
          onPress={() => {
            if (!readOnly) {
              setShow(true);
            }
          }}
        >
          <ThemedText type="body" style={value ? {} : { color: colors.textSecondary }}>
            {formatDisplayDate(value)}
          </ThemedText>
          <Feather name="calendar" size={20} color={colors.textSecondary} />
        </Pressable>

        {show ? (
          <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
            <Pressable style={styles.modalOverlay} onPress={() => setShow(false)}>
              <View style={[styles.webModalContent, { backgroundColor: colors.backgroundDefault }]}>
                <View style={styles.modalHeader}>
                  <ThemedText type="h4">Select Date</ThemedText>
                  <Pressable onPress={() => setShow(false)}>
                    <Feather name="x" size={24} color={colors.text} />
                  </Pressable>
                </View>
                <TextInput
                  style={[styles.webDateInput, { borderColor: colors.inputBorder, color: colors.text }, readOnly && { opacity: 0.6 },]}
                  value={value}
                  onChangeText={(text) => {
                    if (/^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/.test(text)) {
                      onChange(text);
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numbers-and-punctuation"
                  
                />
                <View style={styles.quickDates}>
                  <Pressable
                    style={[styles.quickDateButton, { backgroundColor: colors.primary + "15" }]}
                    onPress={() => { onChange(formatDate(new Date())); setShow(false); }}
                  >
                    <ThemedText type="small" style={{ color: colors.primary }}>Today</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.quickDateButton, { backgroundColor: colors.primary + "15" }]}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      onChange(formatDate(tomorrow));
                      setShow(false);
                    }}
                  >
                    <ThemedText type="small" style={{ color: colors.primary }}>Tomorrow</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.quickDateButton, { backgroundColor: colors.primary + "15" }]}
                    onPress={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      onChange(formatDate(nextWeek));
                      setShow(false);
                    }}
                  >
                    <ThemedText type="small" style={{ color: colors.primary }}>Next Week</ThemedText>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.doneButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShow(false)}
                >
                  <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>Done</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <ThemedText type="small" style={[styles.label]}>{label}</ThemedText> : null}
      <Pressable
        style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
        onPress={() => setShow(true)}
      >
        <ThemedText type="body" style={value ? {} : { color: colors.textSecondary }}>
          {formatDisplayDate(value)}
        </ThemedText>
        <Feather name="calendar" size={20} color={colors.textSecondary} />
      </Pressable>

      {show && !readOnly && Platform.OS === "android" ? (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      ) : null}

      {show && !readOnly && Platform.OS === "ios" ? (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="h4">Select Date</ThemedText>
                <Pressable onPress={handleConfirm}>
                  <ThemedText type="body" style={{ color: colors.primary }}>Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={parseDate(value)}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  webModalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  webDateInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  quickDates: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickDateButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  doneButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
