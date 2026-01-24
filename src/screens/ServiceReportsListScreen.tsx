import React, { useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { useTheme } from "../hooks/useTheme";
import { ServiceReportRecord }  from "../types/serviceReport"
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ReportsStackParamList } from "../navigation/ReportsStackNavigator";
import { useServiceReports } from "../hooks/useServiceReports";

type ReportsNavigationProp = NativeStackNavigationProp<ReportsStackParamList>;

const ITEMS_PER_PAGE = 10;

export default function ServiceReportsListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<ReportsNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;


  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading, error } = useServiceReports(currentPage);


const filteredReports = (data ?? []).filter((report: any) => {
  const matchesSearch =
      (report.companyName || "").toLowerCase().includes(searchQuery) ||
      (report.mcSerialNo || "").toLowerCase().includes(searchQuery) ||
      (report.equipmentTypeName || "").toLowerCase().includes(searchQuery);
    const matchesFilter = filterStatus ? report.status === filterStatus : true;
    return matchesSearch && matchesFilter;
  });

  const paginatedReports = filteredReports; // no pagination



  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "overdue":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderItem = ({ item }: { item: ServiceReportRecord }) => (
    <Card
      elevation={1}
      style={styles.listItem}
      // onPress={() => navigation.navigate("ServiceReportDetail", { id: item.id })}
    >
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <ThemedText type="h4" numberOfLines={1}>
            {item.companyName}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {item.mcSerialNo}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <ThemedText
            type="small"
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.listItemDetails}>
        <View style={styles.detailRow}>
          <Feather name="tool" size={14} color={colors.textSecondary} />
          <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 6 }}>
            {item.equipmentTypeName}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={colors.textSecondary} />
          <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 6 }}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.listItemActions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
          // onPress={() => navigation.navigate("ServiceReportForm", { id: item.id })}
          onPress={() =>
            navigation.navigate("ServiceReportForm", { report: item })
          }
          
        >
          <Feather name="edit-2" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={60} color={colors.textSecondary} />
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Service Reports
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
        Tap the + button to create your first service report
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
        onPress={() => navigation.navigate("ServiceReportForm", {})}
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
