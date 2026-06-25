import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";

import { ThemedText } from "./ThemedText";
import { Colors } from "../constants/theme";
import { FormInput } from "./FormInput";

export interface ChecklistItem {
  check: boolean;
  description: string;
  remarks: string;
}

interface Props {
  data: ChecklistItem[];
  onChange?: (data: ChecklistItem[]) => void;
}

export default function OnOffHireCategoryChecklist({
  data,
  onChange,
}: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(data);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const updateItem = (
    index: number,
    field: keyof ChecklistItem,
    value: boolean | string
  ) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setItems(updated);
    onChange?.(updated);
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Pressable
            style={styles.row}
            onPress={() =>
              updateItem(index, "check", !item.check)
            }
          >
            <View style={styles.radioOuter}>
              {item.check && (
                <View style={styles.radioInner} />
              )}
            </View>
  
            <ThemedText
              type="small"
              style={styles.description}
            >
              {item.description}
            </ThemedText>
          </Pressable>
  
          <FormInput
            placeholder="Enter remarks"
            value={item.remarks}
            onChangeText={(text) =>
              updateItem(index, "remarks", text)
            }
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },

  itemContainer: {
    width: "48%", // 2 columns
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  description: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "500",
    fontSize: 12,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
}); 