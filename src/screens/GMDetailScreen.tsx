import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";

import { ThemedText } from "../components/ThemedText";
import { Card } from "../components/Card";

import { Colors, Spacing, BorderRadius } from "../constants/theme";
import type { MaintenanceStackParamList } from "../navigation/MaintenanceStackNavigator";
import { Feather } from "@expo/vector-icons";

type MaintenanceFormRouteProp = RouteProp<
  MaintenanceStackParamList,
  "GMDetail"
>;

type MaintenanceNavigationProp =
  NativeStackNavigationProp<MaintenanceStackParamList>;

export default function GMDetailScreen() {
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const route = useRoute<MaintenanceFormRouteProp>();

  const existingReport = route.params?.report || null;
  const gmId = route.params?.gm_id;
  const readOnly = route.params?.readOnly;
  

  const colors = Colors.light;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: gmId,
    });
  }, [gmId]);

  if (!existingReport) {
    return (
      <View style={styles.center}>
        <ThemedText>No Record Found</ThemedText>
      </View>
    );
  }

  const status =
    existingReport?.is_pending === "Y"
      ? "Pending"
      : "Completed";

  const statusColor =
    existingReport?.is_pending === "Y"
      ? colors.warning
      : colors.success;

      const selectedServices =
        existingReport?.services?.length > 0
        ? existingReport.services.join(", ")
        : existingReport?.frequency
        ? existingReport.frequency
        : Object.entries(existingReport?.job_list || {})
            .filter(([_, value]) => value === true)
            .map(([key]) =>
              key
                .replaceAll("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            )
            .join(", ");
      // const selectedServices = existingReport?.frequency ? existingReport.frequency
      // : Object.entries(existingReport.job_list)
      // .filter(([_, value]) => value === true)
      // .map(([key]) =>
      //   key
      //     .replaceAll("_", " ")
      //     .replace(/\b\w/g, (c) => c.toUpperCase())
      // )
      // .join(", ")

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  
  const serviceSchedules = [1, 2, 3, 4]
  .map((index) => {
    const date =
    existingReport?.date_list?.[`date${index}`];

    const startTime =
    existingReport?.time_list?.[`start_time${index}`];

    const endTime =
    existingReport?.time_list?.[`end_time${index}`];

    // skip empty rows
    if (!date && !startTime && !endTime) {
      return null;
    }

    return {
      id: index,
      date,
      startTime,
      endTime,
    };
  })
  .filter(Boolean);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.topSection}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h2">
            {existingReport.company_name}
          </ThemedText>

          <ThemedText
            type="body"
            style={{ color: colors.textSecondary }}
          >
            {existingReport.mc}
          </ThemedText>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${statusColor}20`,
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{
              color: statusColor,
              fontWeight: "700",
            }}
          >
            {status}
          </ThemedText>
        </View>
      </View>

      {/* COMPANY DETAILS */}
      <Card style={styles.card}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Company Details
        </ThemedText>

        <DetailItem
          label="Company"
          value={existingReport.company_name}
        />

        <DetailItem
          label="Email"
          value={existingReport.email}
        />

        <DetailItem
          label="Address"
          value={existingReport.company_address}
        />

        <DetailItem
          label="Contact Person"
          value={existingReport.contact_person}
        />

        <DetailItem
          label="Contact No"
          value={existingReport.contact_number}
        />
      </Card>

      {/* EQUIPMENT DETAILS */}
      <Card style={styles.card}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Equipment Details
        </ThemedText>

        <DetailItem
          label="M/C or Serial No"
          value={existingReport.mc}
        />

        <DetailItem
          label="Hour Meter"
          value={existingReport.hr_meter}
        />

        <DetailItem
          label="Job No"
          value={existingReport.job_no}
        />

        <DetailItem
          label="Equipment Type"
          value={existingReport.equipment_type}
        />

        <DetailItem
          label="Equipment"
          value={existingReport.equipment}
        />

        <DetailItem
          label="Client Name"
          value={existingReport.client_name}
        />

        <DetailItem
          label="Client Contact No"
          value={existingReport.client_tel_no}
        />
      </Card>

      {/* SERVICE DETAILS */}
      <Card style={styles.card}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Service Details
        </ThemedText>

        <DetailItem
          label="Technician"
          value={existingReport.technician}
        />

        <DetailItem
          label="Service Types"
          value={selectedServices || "-"}
        />

    <View style={styles.detailItem}>
          <ThemedText
            type="small"
            style={{
              color: colors.textSecondary,
              marginBottom: 10,
            }}
          >
            Service Schedule
          </ThemedText>
          {serviceSchedules.length > 0 ? (
            serviceSchedules.map((item: any) => (
              <View
                key={item.id}
                style={styles.scheduleItem}
              >
                <ThemedText
                  type="body"
                  style={styles.scheduleDate}
                >
                  {formatDate(item.date)}
                </ThemedText>

                <ThemedText
                  type="small"
                  style={{
                    color: colors.textSecondary,
                  }}
                >
                  {item.startTime || "-"} -{" "}
                  {item.endTime || "-"}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText type="body">-</ThemedText>
          )}
        </View>
      </Card>

      {/* REMARKS */}
      <Card style={styles.card}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Remarks
        </ThemedText>

        <ThemedText type="body">
          {existingReport.remarks || "-"}
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
          {Array.isArray(existingReport.images) && existingReport.images.length > 0 ? (
            existingReport.images.map((img: any, index: number) => {
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
        <ThemedText type="h3" style={styles.sectionTitle}>
          Service Info
        </ThemedText>

        <DetailItem
          label="Service Department"
          value={existingReport.service_department}
        />

        <DetailItem
          label="Completion Date"
          value={formatDate(
            existingReport.current_date
          )}
        />

        <DetailItem
          label="Created"
          value={formatDate(
            existingReport.current_date
          )}
        />
      </Card>

      {/* BUTTON */}
      {
         !readOnly &&
          <Pressable
            style={[
              styles.editButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() =>
              navigation.navigate("GMForm", {
                report: existingReport,
                gm_id: existingReport.gm_id,
                readOnly: false,
              })
            }
          >
            <Feather name="edit-2" size={18} color="#fff" />

            <ThemedText
              type="body"
              style={styles.editButtonText}
            >
              Edit Record
            </ThemedText>
          </Pressable>
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
    backgroundColor: Colors.light.backgroundSecondary,
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

  editButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: Spacing.sm,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "700",
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
});