import React from "react";
import { View, StyleSheet } from "react-native";

import { Card } from "./Card";
import { ThemedText } from "./ThemedText";
import { FormInput } from "./FormInput";
import { FormDropdown } from "./FormDropdown";

import { Spacing } from "../constants/theme";

type Props = {
  title: string;
  position?: string | null;
  value: any;
  sectionType: "sendIn" | "onReturn";
  onChange: (
    section: "sendIn" | "onReturn",
    field: "status" | "remarks",
    value: string
  ) => void;
};

const statusOptions = [
  { id: "good", name: "Good" },
  { id: "faulty", name: "Faulty" },
  { id: "na", name: "N/A" },
];

export default function SendInReturnChecklist({
  title, value, onChange, sectionType
}: Props) {
  return (
    <View style={styles.card}>
      <ThemedText type="h4" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.row}>
        <View style={styles.column}>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <FormDropdown
                label="Status"
                options={statusOptions}
                selectedValue={value?.[sectionType]?.status ?? ""}
                onValueChange={(v) =>
                  onChange(sectionType, "status", v)
                }
              />
            </View>

            <View style={styles.inputColumn}>
              <FormInput
                label="Remarks"
                placeholder="Enter Remarks"
                value={value?.[sectionType]?.remarks ?? ""}
                onChangeText={(text) =>
                  onChange(sectionType, "remarks", text)
                }
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
    marginLeft: Spacing.xl
  },

  title: {
    marginBottom: Spacing.md,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  column: {
    flex: 1,
  },

  heading: {
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  
  inputColumn: {
    flex: 1,
  },
});