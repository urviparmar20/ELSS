import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { Card } from "./Card";
import { ThemedText } from "./ThemedText";
import SendInReturnChecklist from "./SendInReturnChecklist";

import { Spacing } from "../constants/theme";


type Props = {
  title: string;
  items: string[];
  values: any;
  onChange: (
    item: string,
    section: "sendIn" | "onReturn",
    field: "status" | "remarks",
    value: string
  ) => void;
};

export default function ChecklistSection({
  title,
  items,
  values,
  onChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  // const [expanded, setExpanded] =
  // useState(title === "Lights");
  return (
    <Card style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.left}>
          <Feather
            name={
              expanded
                ? "chevron-down"
                : "chevron-right"
            }
            size={20}
          />

          <ThemedText type="h4">
            {title.toUpperCase()} ({items.length})
          </ThemedText>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.content}>
          {items.map((item) => (
            <SendInReturnChecklist
              key={item}
              title={item}
              value={values[item]}
              onChange={(section, field, value) =>
                onChange(item, section, field, value)
              }
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },

  header: {
    paddingVertical: Spacing.sm,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },

  content: {
    marginTop: Spacing.md,
  },
});