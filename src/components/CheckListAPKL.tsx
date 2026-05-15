import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";

import { Card } from "./Card";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "../constants/theme";

interface Props {
  checklistData: any;
  onChecklistChange?: (data: any[]) => void;
}

export default function CheckListAPKL({
  checklistData,
  onChecklistChange,
}: Props) {
  // const data = checklistData?.data || [];
  const data = Array.isArray(checklistData?.data)
  ? checklistData.data
  : [];

  const [activityStatus, setActivityStatus] = useState<
    Record<number, number>
  >({});

  const [remarks, setRemarks] = useState<
    Record<number, string>
  >({});


  useEffect(() => {
    if (!data?.length) return;
  
    const statusMap: Record<number, number> = {};
    const remarksMap: Record<number, string> = {};
  
    const processActivity = (activity: any) => {
      // preserve existing status
      if (
        activity.status !== undefined &&
        activity.status !== null
      ) {
        statusMap[activity.id] = Number(activity.status);
      }
  
      // preserve existing remark
      remarksMap[activity.id] =
        activity.remark || "";
    };
  
    const extractActivities = (nodes: any[]) => {
      nodes.forEach((node) => {
        // FLAT ACTIVITY
        if ("activity" in node && "id" in node) {
          processActivity(node);
        }
  
        // DIRECT ACTIVITIES
        if (node.activities?.length) {
          node.activities.forEach((activity: any) => {
            processActivity(activity);
          });
        }
  
        // SYSTEMS
        if (node.systems?.length) {
          node.systems.forEach((system: any) => {
  
            // system.activities
            if (system.activities?.length) {
              system.activities.forEach((activity: any) => {
                processActivity(activity);
              });
            }
  
            // system.items
            if (system.items?.length) {
              extractActivities(system.items);
            }
          });
        }
  
        // ITEMS
        if (node.items?.length) {
          extractActivities(node.items);
        }
      });
    };
  
    extractActivities(data);
  
    setActivityStatus(statusMap);
    setRemarks(remarksMap);
  
    // IMPORTANT
    const initialPayload = buildPayload(
      statusMap,
      remarksMap
    );
  
    onChecklistChange?.(initialPayload);
  
  }, [data]);
  // =========================================
  // BUILD PAYLOAD
  // =========================================
  const buildPayload = (
    statusData: Record<number, number>,
    remarksData: Record<number, string>
  ) => {
    return Object.keys(statusData).map((id) => ({
      activity_id: Number(id),
      status: statusData[Number(id)],
      remark: remarksData[Number(id)] || "",
    }));
  };

  // =========================================
  // HANDLE STATUS
  // =========================================
  const handleStatusChange = (
    activityId: number,
    value: number
  ) => {
    setActivityStatus((prev) => {
      const updatedStatus = {
        ...prev,
        [activityId]: value,
      };

      const payload = buildPayload(
        updatedStatus,
        remarks
      );

      onChecklistChange?.(payload);

      return updatedStatus;
    });
  };

  // =========================================
  // HANDLE REMARKS
  // =========================================
  const handleRemarkChange = (
    activityId: number,
    value: string
  ) => {
    setRemarks((prev) => {
      const updatedRemarks = {
        ...prev,
        [activityId]: value,
      };

      const payload = buildPayload(
        activityStatus,
        updatedRemarks
      );

      onChecklistChange?.(payload);

      return updatedRemarks;
    });
  };

  // =========================================
  // COMMON ACTIVITY UI
  // =========================================
  const renderActivity = (
    activity: any,
    index?: number
  ) => {
    const selectedStatus =
      activityStatus[activity.id];

    return (
      <View
        key={activity.id}
        style={styles.activityCard}
      >
        {/* ACTIVITY */}
        <View style={styles.activityRow}>
          <ThemedText style={styles.bullet}>
            {index !== undefined
              ? `${index + 1}.`
              : "•"}
          </ThemedText>

          <ThemedText style={styles.activityText}>
            {activity.activity}
          </ThemedText>
        </View>

        {/* RADIO BUTTONS */}
        <View style={styles.radioContainer}>
          {/* GOOD */}
          <Pressable
            style={styles.radioOption}
            onPress={() =>
              handleStatusChange(
                activity.id,
                1
              )
            }
          >
            <View style={styles.radioOuter}>
              {selectedStatus === 1 && (
                <View style={styles.radioInner} />
              )}
            </View>

            <ThemedText type="small">
              GOOD
            </ThemedText>
          </Pressable>

          {/* FAULTY */}
          <Pressable
            style={styles.radioOption}
            onPress={() =>
              handleStatusChange(
                activity.id,
                0
              )
            }
          >
            <View style={styles.radioOuter}>
              {selectedStatus === 0 && (
                <View style={styles.radioInner} />
              )}
            </View>

            <ThemedText type="small">
              FAULTY
            </ThemedText>
          </Pressable>
        </View>

        {/* REMARKS */}
        <TextInput
          placeholder="Enter remarks"
          value={remarks[activity.id] || ""}
          onChangeText={(text) =>
            handleRemarkChange(
              activity.id,
              text
            )
          }
          multiline
          style={styles.input}
        />
      </View>
    );
  };

  // =========================================
  // FORKLIFT WEEKLY SPECIAL CASE
  // =========================================
  // const isFlatActivityArray =
  //   Array.isArray(data) &&
  //   data.length > 0 &&
  //   "activity" in data[0];
  const isFlatActivityArray =
  Array.isArray(data) &&
  data.length > 0 &&
  data[0] &&
  typeof data[0] === "object" &&
  "activity" in data[0];

  // =========================================
  // FORKLIFT WEEKLY VIEW
  // =========================================
  if (isFlatActivityArray) {
    return (
      <Card elevation={1} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Operation Checklist
          </ThemedText>
        </View>

        {Array.isArray(data) && data.map(
          (activity: any, index: number) =>
            renderActivity(activity, index)
        )}
      </Card>
    );
  }

  // =========================================
  // NORMAL VIEW
  // =========================================
  return (
    <Card elevation={1} style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>
          Operation Checklist
        </ThemedText>
      </View>

      <View>
        {Array.isArray(data) && data.map((unit: any) => (
          <View
            key={unit.unit_id}
            style={styles.unitCard}
          >
            {/* UNIT TITLE */}
            <ThemedText style={styles.unitTitle}>
              {unit.unit_name}
            </ThemedText>

            {/* SYSTEMS */}
            {unit.systems?.length > 0 &&
              unit.systems.map((system: any) => (
                <View
                  key={system.system_id}
                  style={styles.systemContainer}
                >
                  <ThemedText
                    style={styles.systemTitle}
                  >
                    {system.system_name}
                  </ThemedText>

                  {system.items?.map((item: any) => (
                    <View
                      key={item.item_id}
                      style={styles.itemContainer}
                    >
                      <ThemedText
                        style={styles.itemTitle}
                      >
                        {item.item_name}
                      </ThemedText>

                      {item.activities?.map(
                        (activity: any) =>
                          renderActivity(activity)
                      )}
                    </View>
                  ))}
                </View>
              ))}

            {/* DIRECT ITEMS */}
            {unit.items?.length > 0 &&
              unit.items.map((item: any) => (
                <View
                  key={item.item_id}
                  style={styles.itemContainer}
                >
                  <ThemedText
                    style={styles.itemTitle}
                  >
                    {item.item_name}
                  </ThemedText>

                  {item.activities?.map(
                    (activity: any) =>
                      renderActivity(activity)
                  )}
                </View>
              ))}

            {/* DIRECT ACTIVITIES */}
            {unit.activities?.length > 0 &&
              unit.activities.map(
                (activity: any) =>
                  renderActivity(activity)
              )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },

  sectionHeader: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  unitCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  unitTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111827",
  },

  systemContainer: {
    marginBottom: 14,
  },

  systemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2563EB",
  },

  itemContainer: {
    marginLeft: 10,
    marginBottom: 10,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },

  activityCard: {
    marginBottom: 16,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  bullet: {
    marginRight: 6,
    fontSize: 14,
    fontWeight: "700",
  },

  activityText: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },

  radioContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: 20,
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },

  radioInner: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.light.primary,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    minHeight: 45,
    textAlignVertical: "top",
  },
});