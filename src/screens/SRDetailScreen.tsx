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

import type { ReportsStackParamList } from "../navigation/ReportsStackNavigator";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

type ServiceReportFormRouteProp = RouteProp<
  ReportsStackParamList,
  "ServiceReportForm"
>;

type ReportsNavigationProp =
  NativeStackNavigationProp<ReportsStackParamList>;

export default function SRDetailScreen() {

  const navigation = useNavigation<ReportsNavigationProp>();
  const route = useRoute<ServiceReportFormRouteProp>();

  const existingReport = route.params?.report || null;
  const srId = route.params?.sr_id;
  const readOnly = route.params?.readOnly;
  const colors = Colors.light;

  const report = existingReport?.raw || existingReport;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: srId,
    });
  }, [srId]);

  if (!report) {
    return (
      <View style={styles.center}>
        <ThemedText>No Report Found</ThemedText>
      </View>
    );
  }

  const serviceSchedules = [1, 2, 3, 4]
  .map((index) => {
    const date =
      report?.date_list?.[`date${index}`];

    const startTime =
      report?.time_list?.[`start_time${index}`];

    const endTime =
      report?.time_list?.[`end_time${index}`];

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

  const status =
    report?.is_pending === "Y"
      ? "Pending"
      : "Completed";

  const statusColor =
    report?.is_pending === "Y"
      ? colors.warning
      : colors.success;

  // SERVICE TYPES
  const selectedServices = report?.description_status_list
    ? Object.entries(report.description_status_list)
        .filter(([_, value]) => value === "true")
        .map(([key]) =>
          key
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) =>
              c.toUpperCase()
            )
        )
        .join(", ")
    : "-";

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* TOP */}
      <View style={styles.topSection}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h2">
            {report.company_name ||
              "No Company"}
          </ThemedText>

          <ThemedText
            type="body"
            style={{
              color: colors.textSecondary,
            }}
          >
            {report.mc}
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
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Company Details
        </ThemedText>

        <DetailItem
          label="Client Name"
          value={report.client_name}
        />

        <DetailItem
          label="Contact No"
          value={report.client_tel_no}
        />

        <DetailItem
          label="Address"
          value={report.company_address}
        />
      </Card>

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
          value={report.equipment_id}
        />

        <DetailItem
          label="M/C Serial No"
          value={report.serial_no}
        />

        <DetailItem
          label="Hour Meter"
          value={report.hr_meter}
        />

        <DetailItem
          label="Job No"
          value={report.job_no}
        />
      </Card>

      {/* SERVICE DETAILS */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Service Details
        </ThemedText>

        <DetailItem
          label="Technician"
          value={report.technician}
        />

        <DetailItem
          label="Service Type"
          value={selectedServices}
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

      {/* DESCRIPTION */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Description
        </ThemedText>

        <ThemedText type="body">
          {report.description || "-"}
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
          {Array.isArray(report.images) && report.images.length > 0 ? (
            report.images.map((img: any, index: number) => {
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
          Service Info
        </ThemedText>

        <DetailItem
          label="Created Date"
          value={formatDate(
            report.filled_date
          )}
        />

        <DetailItem
          label="Chargable"
          value={
            report.is_chargable === "Y"
              ? "Yes"
              : "No"
          }
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
              navigation.navigate("ServiceReportForm", {
                report: existingReport,
                sr_id: existingReport.raw.sr_id,
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