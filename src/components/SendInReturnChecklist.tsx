import React from "react";
import { View, StyleSheet } from "react-native";

import { Card } from "./Card";
import { ThemedText } from "./ThemedText";
import { FormInput } from "./FormInput";
import { FormDropdown } from "./FormDropdown";

import { Spacing } from "../constants/theme";

type Props = {
  title: string;
  value: any;
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
  title, value, onChange
}: Props) {
  return (
    <Card style={styles.card}>
      <ThemedText type="h4" style={styles.title}>
        {title}
      </ThemedText>

      <View style={styles.row}>
        {/* SEND IN */}
        <View style={styles.column}>
          <ThemedText type="body" style={styles.heading}>
            Send In
          </ThemedText>

          <FormDropdown
            label="Status"
            options={statusOptions}
            selectedValue={value?.sendIn?.status ?? ""}
            onValueChange={(v) =>
              onChange("sendIn", "status", v)
            }
          />

          <FormInput
            label="Remarks"
            value={value?.sendIn?.remarks ?? ""}
            onChangeText={(text) =>
              onChange("sendIn", "remarks", text)
            }
          />
        </View>

        {/* RETURN */}
        <View style={styles.column}>
          <ThemedText type="body" style={styles.heading}>
            On Return
          </ThemedText>

          <FormDropdown
            label="Status"
            options={statusOptions}
            selectedValue={value?.onReturn?.status ?? ""}
            onValueChange={(v) =>
              onChange("onReturn", "status", v)
            }
          />

          <FormInput
            label="Remarks"
            value={value?.onReturn?.remarks ?? ""}
            onChangeText={(text) =>
              onChange("onReturn", "remarks", text)
            }
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },

  title: {
    marginBottom: Spacing.md,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  column: {
    flex: 1,
  },

  heading: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
});