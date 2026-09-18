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


type ChecklistItem = {
  checklist_item_id: number;
  item: string;
  position: string | null;
  status: string | null;
  remarks: string;
};

type Props = {
  title: string;
  items: ChecklistItem[];
  values: any;
  sectionType: "sendIn" | "onReturn";

  onChange: (
    checklist_item_id: number,
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
  sectionType
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
        <>
          {items.map((item) => (
            <SendInReturnChecklist
              key={item.checklist_item_id}
              title={item.item}
              position={item.position}
              value={values[item.checklist_item_id]}
              onChange={(section, field, value) =>
                onChange(item.checklist_item_id, section, field, value)
              }
              sectionType={sectionType}
            />
        ))}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },

  header: {
    paddingVertical: Spacing.sm,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});