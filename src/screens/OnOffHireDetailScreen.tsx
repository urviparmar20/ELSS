import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView
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
import { ONOffHireStackParamList } from "../navigation/OnOffHireStackNavigator";
import { formatDate } from "../utils/formatDate";
import { CustomButton } from "../components/CustomButton";

type ONOffHireFormRouteProp = RouteProp<
  ONOffHireStackParamList,
  "OnOffHireForm"
>;

type ONOffHireNavigationProp =
  NativeStackNavigationProp<ONOffHireStackParamList>;

export default function OnOffHireDetailScreen() {

  const navigation = useNavigation<ONOffHireNavigationProp>();
  const route = useRoute<ONOffHireFormRouteProp>();

  const existingReport = route.params?.onOffHire || null;
  const hireId = route.params?.hire_id;
  const readOnly = route.params?.readOnly;
  const colors = Colors.light;

  const report = existingReport?.raw || existingReport;  
  const hireData =
  report.status === "COMPLETED"
    ? report.off_hire
    : report.on_hire;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: String(hireId ?? ""),

    });
  }, [hireId]);

  if (!report) {
    return (
      <View style={styles.center}>
        <ThemedText>No On/Off Hire Found</ThemedText>
      </View>
    );
  }

  // SERVICE TYPES
  const selectedServices = hireData?.condition_list
    ? Object.entries(hireData?.condition_list)
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
          label="Contact Name"
          value={hireData?.contact_person_name}
        />

        <DetailItem
          label="Contact No"
          value={hireData?.contact_no}
        />

        <DetailItem
          label="Address"
          value={report.company_address}
        />

        <DetailItem
          label="Location"
          value={report.location}
        />

        <DetailItem
          label="Date"
          value={formatDate(hireData?.date)}
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
          value={hireData?.hr_meter}
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
          label="Service Type"
          value={selectedServices}
        />
      </Card>

      {/* DESCRIPTION */}
      <Card style={styles.card}>
        <ThemedText
          type="h3"
          style={styles.sectionTitle}
        >
          Remarks
        </ThemedText>

        <ThemedText type="body">
          {hireData?.remarks || "-"}
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
          {Array.isArray(hireData?.images) && hireData?.images.length > 0 ? (
            hireData?.images.map((img: any, index: number) => {
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
          {
            report.status == "COMPLETED" ? "Return / Off Hire Checking" : "Handover / On Hire Checking"
          }
          
        </ThemedText>

        <DetailItem
          label="Service Technician"
          value={hireData?.technician}
        />

        <DetailItem
          label="Accepted by"
          value={hireData?.accepted_by}
        />

        <DetailItem
          label="Work Permit"
          value={hireData?.work_permit}
        />

        <DetailItem
          label="Contractor name"
          value={hireData?.contractor_name}
        />

        <DetailItem
          label="Hire Date"
          value={formatDate(hireData?.date)}
        />

      </Card>
       {/* BUTTON */}
       {
         !readOnly && report?.status == "ON_HIRE" &&
         <View style={styles.buttonView}>
          <View style={styles.buttonWrapper}>
            <CustomButton
              onPress={() =>
                navigation.navigate("OnOffHireForm", {
                  onOffHire: report,
                  hire_id: report.hire_id,
                  readOnly: false,
                  flag: "needToOffHire",
                })
              }
            >
              Need to Off Hire
            </CustomButton>
          </View>

          <View style={styles.buttonWrapper}>
            <CustomButton
              onPress={() =>
                navigation.navigate("OnOffHireForm", {
                  onOffHire: report,
                  hire_id: report.hire_id,
                  readOnly: false,
                })
              }
            >
              Edit On Hire
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
});