import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { useTheme } from "../hooks/useTheme";
// import { useData, MaintenanceRecord } from "@/contexts/DataContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { MaintenanceStackParamList } from "../navigation/MaintenanceStackNavigator";
import { useGeneralMaintenanceList } from "../hooks/useGeneralMaintenanceList";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from "../components/Card";
import { MaintenanceRecord } from "../types/maintenance";


type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;

const ITEMS_PER_PAGE = 10;

export default function GMListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [gMList, setgMList] = useState<any[]>([]);
// console.log('gMList',gMList);

  const { data, isLoading } =
  useGeneralMaintenanceList(currentPage);

  useEffect(() => {
    if (data?.data?.generalMaintenance) {
      setgMList(data.data?.generalMaintenance);
    }
  }, [data]); 

 

  const getStatusColor = (isPending: "Y" | "N") => {
    return isPending === "Y" ? colors.warning : colors.success;
  };

  const getStatusLabel = (isPending: "Y" | "N") => {
    return isPending === "Y" ? "pending" : "completed";
  };

  const getStatusText = (isPending: "Y" | "N") => {
    return isPending === "Y" ? "Pending" : "Completed";
  };

  const filteredReports = (gMList ?? []).filter((report: any) => {
    const matchesSearch =
        (report.company_name || "").toLowerCase().includes(searchQuery) ||
        (report.mc || "").toLowerCase().includes(searchQuery) ||
        (report.equipment_type || "").toLowerCase().includes(searchQuery);
      const matchesFilter = filterStatus
  ? getStatusLabel(report.is_pending) === filterStatus
  : true;

      return matchesSearch && matchesFilter;
    });
  
  const paginatedReports = filteredReports;
  
  const queryClient = useQueryClient();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["general-maintenance"],
      });
    }, [])
  );
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderItem = ({ item }: { item: MaintenanceRecord }) => (
    <Card
      elevation={1}
      style={styles.listItem}
      // onPress={() => navigation.navigate("ServiceReportDetail", { id: item.id })}
    >
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <ThemedText type="h4" numberOfLines={1}>
            {item.company_name}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {item.equipment}
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
            navigation.navigate("GMForm", { report: item })
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
            placeholder="Search reports..."
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

      <View style={styles.filterContainer}>
        <FilterChip label="All" value={null} />
        <FilterChip label="Pending" value="pending" />
        <FilterChip label="Completed" value="completed" />
      </View>

      <FlatList
        data={paginatedReports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing["5xl"] },
        ]}
        ListEmptyComponent={renderEmptyState}
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
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
    flex: 1,
    marginRight: Spacing.md,
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
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfo: {
    minWidth: 100,
    textAlign: "center",
  },
});
