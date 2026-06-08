import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { MaintenanceStackParamList } from "../navigation/MaintenanceStackNavigator";
import { useGeneralMaintenanceList } from "../hooks/useGeneralMaintenanceList";
import { Card } from "../components/Card";
import { MaintenanceRecord } from "../types/maintenance";
import CustomLoader from "../components/CustomLoader";
import { FormDatePicker } from "../components/FormDatePicker";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { FormDropdown } from "../components/FormDropdown";

type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;

const ITEMS_PER_PAGE = 20;

export default function GMListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;

  const frequencyOptions = [
    { id: "", name: "All Frequencies" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
    { id: "quarterly", name: "Quarterly" },
    { id: "yearly", name: "Yearly" },
  ];

  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [frequencyFilter, setFrequencyFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [gMList, setgMList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } =
  useGeneralMaintenanceList();

  useEffect(() => {
    if (data?.data?.generalMaintenance) {
      setgMList(data.data?.generalMaintenance);
    }
  }, [data]); 

  // console.log(
  //   data?.data?.generalMaintenance[0]
  // );
  
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus, frequencyFilter, gMList]);

  const getStatusColor = (isPending: "Y" | "N") => {
    return isPending === "Y" ? colors.warning : colors.success;
  };

  const getStatusLabel = (isPending: "Y" | "N") => {
    return isPending === "Y" ? "pending" : "completed";
  };

  const getStatusText = (isPending: "Y" | "N") => {
    return isPending === "Y" ? "Pending" : "Completed";
  };

  const normalizeText = (text: string) =>
    text
      .replace(/–/g, "-")
      .trim()
      .toLowerCase();

  const getJobLabel = (key: string) => {
    const labels: Record<string, string> = {
      weekly_checking: "Weekly",
      monthly: "Monthly",
      half_yearly: "Quarterly",
      yearly_servicing: "Yearly",
      cleaning: "Cleaning",
      washing: "Washing",
    };
  
    return labels[key] || toTitleCase(key);
  };

  const getReportFrequency = (report: any) => {
    // 1. Use frequency field if available
    if (report.frequency) {
      const freq = report.frequency.toLowerCase().trim();
  
      if (freq === "half_yearly") return "quarterly";
  
      return freq;
    }
  
    // 2. Fallback to job_list
    if (report.job_list) {
      const jobs = report.job_list;
  
      if (jobs.weekly_checking) return "weekly";
      if (jobs.monthly) return "monthly";
  
      // Half Yearly should appear under Quarterly filter
      if (jobs.half_yearly) return "quarterly";
  
      if (jobs.yearly_servicing) return "yearly";
    }
  
    return "";
  };
  const filteredReports = (gMList ?? []).filter(
    (report: any) => {
      const query = normalizeText(searchQuery);

      const matchesSearch =
        (report.company_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
  
        (report.mc || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
  
        (report.equipment_type || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||

        normalizeText(String(report.gm_id || "")).includes(query);

  
      const matchesFilter = filterStatus
        ? getStatusLabel(report.is_pending) ===
          filterStatus
        : true;

      const matchesFrequency = frequencyFilter
        ? getReportFrequency(report) === frequencyFilter
        : true;  
  
      // DATE FILTER
      const reportDate = new Date(
        report.current_date
      );
  
      const from =
        fromDate
          ? reportDate >= new Date(fromDate)
          : true;
  
      const to =
        toDate
          ? reportDate <= new Date(toDate)
          : true;
  
      return (
        matchesSearch &&
        matchesFilter &&
        matchesFrequency &&
        from &&
        to
      );
    }
  );

  const visibleReports = filteredReports.slice(
    0,
    page * ITEMS_PER_PAGE
  );
    
  const loadMore = () => {
    if (isFetchingMore) return;
  
    if (visibleReports.length >= filteredReports.length) return;
  
    setIsFetchingMore(true);
  
    // simulate async loading (for UX)
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsFetchingMore(false);
    }, 500);
  };
    
  
  
  const queryClient = useQueryClient();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["general-maintenance"],
      });
    }, [])
  );

  const toTitleCase = (text: string) =>
    text
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());

      const getFrequencyOrJobs = (report: any) => {
        if (report.frequency?.trim()) {
          return toTitleCase(report.frequency);
        }
      
        if (!report.job_list) {
          return "-";
        }
      
        const activeJobs = Object.entries(report.job_list)
          .filter(
            ([key, value]) =>
              value === true &&
              !["cleaning", "washing"].includes(key)
          )
          .map(([key]) => getJobLabel(key));
      
        return activeJobs.length
          ? activeJobs.join(", ")
          : "-";
      };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
  
    return (
      <View style={{ paddingVertical: 20 }}>
      <CustomLoader size="large" color={colors.primary} />
    </View>
    );
  };
  

  const renderItem = ({ item }: { item: MaintenanceRecord }) => (
    <Card
      elevation={1}
      style={styles.listItem}
      onPress={() => navigation.navigate("GMDetail", { report: item, gm_id: item.gm_id, readOnly: false })}
    > 
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <ThemedText type="small" numberOfLines={1} style={styles.gmId}>
            {item.gm_id}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.is_pending) + "20" },
          ]}
        >
          <ThemedText
            type="small"
            style={[styles.statusText, { color: getStatusColor(item.is_pending) }]}
          >
            {getStatusText(item.is_pending)}
          </ThemedText>
        </View>
        {/* <View>
          <ThemedText
            type="small"
            style={[styles.statusText, { color: colors.primary }]}
          >
            {getChecklistLabel(item.checklist_version)}
          </ThemedText>
        </View> */}
      </View>
      
      <View style={styles.listItemHeader}>
        <View>
          <View style={[
            { backgroundColor: colors.error + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, alignSelf: "flex-start", },
          ]}>
            <ThemedText
              type="small"
              style={{
                color: colors.error
              }}
            >
              {getFrequencyOrJobs(item)}
            </ThemedText>
          </View>
          <ThemedText type="h4" numberOfLines={1}>
            {item.company_name}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {item.equipment}
          </ThemedText>
        </View>
        {/* <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.is_pending) + "20" },
          ]}
        >
          <ThemedText
            type="small"
            style={[styles.statusText, { color: getStatusColor(item.is_pending) }]}
          >
            {getStatusText(item.is_pending)}
          </ThemedText>
        </View> */}
      </View>

      <View style={styles.listItemDetails}>
        <View style={styles.detailRow}>
          <Feather name="tool" size={14} color={colors.textSecondary} />
          <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 6 }}>
            {item.equipment_type}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={colors.textSecondary} />
          <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 6 }}>
            {formatDate(item.current_date)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.listItemActions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
          onPress={() =>
            navigation.navigate("GMForm", { report: item, gm_id: item.gm_id, readOnly: false })
          }
        >
          <Feather name="edit-2" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="tool" size={60} color={colors.textSecondary} />
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Maintenance Records
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
        Tap the + button to create your first maintenance record
      </ThemedText>
    </View>
  );

  const FilterChip = ({ label, value }: { label: string; value: string | null }) => (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: filterStatus === value ? colors.primary : colors.backgroundSecondary,
        },
      ]}
      onPress={() => setFilterStatus(filterStatus === value ? null : value)}
    >
      <ThemedText
        type="small"
        style={{ color: filterStatus === value ? "#fff" : theme.text }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
          ]}
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchTextInput, { color: theme.text }]}
            placeholder="Search GM..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={styles.filterRow}>
          <View style={styles.filterContainer}>
            <FilterChip label="All" value={null} />
            <FilterChip label="Pending" value="pending" />
            <FilterChip label="Completed" value="completed" />
          </View>

          <Pressable
            style={[
              styles.frequencyChip,
              {
                backgroundColor: frequencyFilter
                  ? colors.primary + "20"
                  : colors.backgroundSecondary,
              },
            ]}
            onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
          >
            <ThemedText
              type="small"
              style={{
                color: frequencyFilter ? colors.primary : theme.text,
              }}
            >
              {frequencyOptions.find(
                item => item.id === frequencyFilter
              )?.name || "Frequency"}
            </ThemedText>

            <Feather
              name={showFrequencyDropdown ? "chevron-up" : "chevron-down"}
              size={14}
              color={colors.textSecondary}
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>



        <View style={{ position: "relative" }}>
          {showFrequencyDropdown && (
            <View
              style={[
                styles.frequencyDropdown,
                {
                  backgroundColor: colors.backgroundDefault,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              {frequencyOptions.map(option => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.frequencyOption,
                    option.id === frequencyFilter && {
                      backgroundColor: colors.primary + "15",
                    },
                  ]}
                  onPress={() => {
                    setFrequencyFilter(option.id || null);
                    setShowFrequencyDropdown(false);
                  }}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color:
                        option.id === frequencyFilter
                          ? colors.primary
                          : theme.text,
                    }}
                  >
                    {option.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>

      </View>

      <View style={styles.dateFilterRow}>
        {/* FROM */}
        <View style={{ flex: 1 }}>
          <FormDatePicker
            value={fromDate}
            placeholder="From"
            onChange={(selectedDate) => {

              if (
                toDate &&
                new Date(selectedDate) >
                  new Date(toDate)
              ) {
                Toast.show({
                  type: "error",
                  text1: "From date cannot be later than To date",
                });
                return;
              }

              setFromDate(selectedDate);
            }}
          />
        </View>

        <ThemedText style={styles.dateSeparator}>
          —
        </ThemedText>

        {/* TO */}
        <View style={{ flex: 1 }}>
          <FormDatePicker
            value={toDate}
            placeholder="To"
            onChange={(selectedDate) => {

              if (
                fromDate &&
                new Date(selectedDate) <
                  new Date(fromDate)
              ) {
                Toast.show({
                  type: "error",
                  text1: "To date cannot be earlier than From date",
                });
                return;
              }

              setToDate(selectedDate);
            }}
          />
      </View>

  {/* CLEAR BUTTON */}
  {(fromDate || toDate) && (
    <Pressable
      style={styles.clearDateButton}
      onPress={() => {
        setFromDate("");
        setToDate("");
      }}
    >
      <Feather
        name="x"
        size={18}
        color="#fff"
      />
    </Pressable>
  )}

      </View>

      <FlatList
        data={visibleReports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing["5xl"] },
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.secondary, bottom: tabBarHeight + Spacing.xl },
        ]}
        onPress={() => navigation.navigate("GMForm", {})}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
    height: "100%",
  },
  filterContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    flex: 1, 
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  listItem: {
    marginBottom: Spacing.md,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  listItemInfo: {
    marginRight: Spacing.md,
    backgroundColor: Colors.light.blueBG,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  gmId:{
    fontSize: Spacing.md,
    fontWeight: 600,
    color: Colors.light.blue
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  listItemDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  
  dateSeparator: {
    marginBottom: Spacing.md,
    color: Colors.light.textSecondary,
  },
  clearDateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.error,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  frequencyDropdown: {
    position: "absolute",
    top: 20,
    right: 15,
    width: 180,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 5,
    zIndex: 999,
  },
  
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  
  frequencyChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginLeft: "auto",
  },
});
