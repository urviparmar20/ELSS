import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable
} from "react-native";

import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "../components/ThemedText";
import { Card } from "../components/Card";

import {
  Colors,
  Spacing,
  BorderRadius,
} from "../constants/theme";

import { Image } from "expo-image";
import { formatDate } from "../utils/formatDate";
import { CustomButton } from "../components/CustomButton";
import { SendInReturnStackParamList } from "../navigation/SendInReturnStackNavigator";

type ONOffHireFormRouteProp = RouteProp<SendInReturnStackParamList,"SendInReturnForm">;

type SendInReturnNavigationProp = NativeStackNavigationProp<SendInReturnStackParamList>;

export default function SendInReturnDetailScreen() {

  const navigation = useNavigation<SendInReturnNavigationProp>();
  const route = useRoute<ONOffHireFormRouteProp>();

  const existingReport = route.params?.sendInReturn || null;
  const hireId = route.params?.sendIn_id;
  const readOnly = route.params?.readOnly;
  const colors = Colors.light;

  const report = existingReport?.raw || existingReport; 

  const reportData = report?.status == 1 
  ? report?.send_in 
  : report?.return; 
  

  useEffect(() => {
    navigation.setOptions({
      headerTitle: String(hireId ?? ""),

    });
  }, [hireId]);

  if (!report) {
    return (
      <View style={styles.center}>
        <ThemedText>No Send In/Return Found</ThemedText>
      </View>
    );
  }

  const groupedChecklist = reportData?.checklist?.reduce(
    (acc: any, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* EQUIPMENT DETAILS */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Equipment Details
        </ThemedText>

        <DetailItem
          label="Equipment Type"
          value={report.equipment_type}
        />

        <DetailItem
          label="Equipment ID"
          value={report.equipment_name}
        />

        <DetailItem
          label="Brand"
          value={report.brand}
        />    
        <DetailItem
          label="Model No"
          value={report.model}
        />

        <DetailItem
          label="M/C Serial No"
          value={report.serial_no}
        />

        <DetailItem
          label="Hour Meter"
          value={reportData?.hour_meter}
        />
      </Card>

      {/* SERVICE DETAILS */}
      <Card style={styles.card}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Checklist
        </ThemedText>

        {Object.entries(groupedChecklist || {}).map(([category, items]: any) => {
          const filteredItems = items.filter(
            (item: any) => item.status !== null && item.status !== ""
          );

          if (filteredItems.length === 0) return null;

          return (
            <View key={category} style={{ marginBottom: 20 }}>
              <ThemedText type="h4" style={{ marginBottom: 10 }}>
                {category}
              </ThemedText>

              {filteredItems.map((item: any) => (
                <View
                  key={item.checklist_item_id}
                  style={styles.checklistItem}
                >
                  <ThemedText>
                    • {item.item}
                    {item.position ? ` (${item.position})` : ""}
                  </ThemedText>

                  <ThemedText type="small">
                    Status:{" "}
                    {item.status === "1"
                      ? "Good"
                      : item.status === "0"
                      ? "Faulty"
                      : "-"}
                  </ThemedText>

                  {!!item.remarks && (
                    <ThemedText
                      type="small"
                      style={styles.remarks}
                    >
                      Remarks: {item.remarks}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </Card>

      {/* DESCRIPTION */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Complaints
        </ThemedText>

        <ThemedText type="body">
          {reportData.complaints ||  "-"}
        </ThemedText>
      </Card>

      {/* IMAGES */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Images
        </ThemedText>

        <View style={styles.imagesContainer}>
          {Array.isArray(reportData?.images) && reportData?.images.length > 0 ? (
            reportData?.images.map((img: any, index: number) => {
              const imageUri =
                typeof img === "string"
                  ? img
                  : img?.uri || img?.image || img?.url;

              return (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={styles.reportImage}
                  contentFit="cover"
                />
              );
            })
          ) : (
            <ThemedText type="body">-</ThemedText>
          )}
        </View>
      </Card>

      {/* SERVICE INFO */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          {report?.status === 1 
            ? "Send In and Received By" 
            : "Return and Accepted By"}
        </ThemedText>

        {report?.status === 1 ? (
          <>
            <DetailItem
              label="Send In By"
              value={reportData?.send_in_by_name}
            />

            <DetailItem
              label="Received by"
              value={reportData?.checked_received_by_name}
            />
          </>
        ) : (
          <>
            <DetailItem
              label="Checked and Accepted By"
              value={reportData?.checked_accepted_by_name}
            />

            <DetailItem
              label="Mechanic"
              value={reportData?.mechanic_name}
            />

            <DetailItem
              label="Foreman"
              value={reportData?.foreman_name}
            />
          </>
        )}

        <DetailItem
          label="Date"
          value={formatDate(reportData?.date)}
        />

        <DetailItem
          label="Time"
          value={formatDate(reportData?.time)}
        />
      </Card>

       {/* BUTTON */}
       {
         !readOnly && report?.status == 1 &&
         <View style={styles.buttonView}>
          <View style={styles.buttonWrapper}>
            <CustomButton
              onPress={() =>
                navigation.navigate("SendInReturnForm", {
                  sendInReturn: report,
                  sendIn_id: report.inspection_id,
                  readOnly: false,
                  flag: "needToReturn",
                })
              }
            >
              Need to Return
            </CustomButton>
          </View>

          <View style={styles.buttonWrapper}>
            <CustomButton
              onPress={() =>
                navigation.navigate("SendInReturnForm", {
                  sendInReturn: report,
                  sendIn_id: report.inspection_id,
                  readOnly: false,
                  flag: "needToUpdate",
                })
              }
            >
              Edit Send In
            </CustomButton>
          </View>
        </View>
       }
    </ScrollView>
  );
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  const colors = Colors.light;

  return (
    <View style={styles.detailItem}>
      <ThemedText
        type="small"
        style={{
          color: colors.textSecondary,
          marginBottom: 2,
        }}
      >
        {label}
      </ThemedText>

      <ThemedText type="body">
        {value || "-"}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.light.backgroundSecondary,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },

  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },

  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 24,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: "700",
  },

  detailItem: {
    marginBottom: Spacing.lg,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  
  scheduleDate: {
    fontWeight: "600",
    marginBottom: 4,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  
  reportImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  buttonView: {
    flexDirection: "row",
    gap: 12, // or marginHorizontal if your RN version doesn't support gap
  },
  
  buttonWrapper: {
    flex: 1,
  },
  
  editButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  editButtonText: {
    color: "#fff",
    marginLeft: 8,
  },
  checklistItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  checklistTitle: {
    flex: 1,
    fontWeight: "600",
  },
  
  remarks: {
    marginTop: 4,
    color: Colors.light.textSecondary,
  },
});