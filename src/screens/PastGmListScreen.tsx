import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
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
import { Card } from "../components/Card";
import { MaintenanceRecord } from "../types/maintenance";
import CustomLoader from "../components/CustomLoader";
import { usePastGMList } from "../hooks/userPastGMList";
import { FormDatePicker } from "../components/FormDatePicker";
import { Toast } from "react-native-toast-message/lib/src/Toast";

type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;

const ITEMS_PER_PAGE = 20;

export default function PastGMListScreen() {
  // const tabBarHeight = useBottomTabBarHeight();
  
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [gMList, setgMList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, isLoading } = usePastGMList();  

  useEffect(() => {
    if (data?.data?.generalMaintenance) {
      setgMList(data.data?.generalMaintenance);
    }
  }, [data]); 

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus, gMList]);

  const getStatusLabel = (isPending: "Y" | "N") => {
    return isPending === "Y" ? "pending" : "completed";
  };

    const normalizeText = (text: string) =>
    text
      .replace(/–/g, "-")
      .trim()
      .toLowerCase();
      
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
          ? getStatusLabel(report.is_pending) === filterStatus
          : true;
    
        // DATE FILTER
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
      onPress={() => navigation.navigate("GMDetail", { report: item, gm_id: item.gm_id, readOnly: true })}
    >
      <ThemedText type="body" numberOfLines={1} style={styles.gmId}>
        {item.gm_id}
      </ThemedText>
      <View style={styles.listItemHeader}>
        <View>
          <ThemedText type="h4" numberOfLines={1}>
            {item.company_name}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {item.equipment}
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
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="tool" size={60} color={colors.textSecondary} />
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Maintenance Records
      </ThemedText>
    </View>
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
                  text1:
                    "From date cannot be later than To date",
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
                  text1:
                    "To date cannot be earlier than From date",
                });
                return;
              }

              setToDate(selectedDate);
            }}
          />
        </View>

        {/* CLEAR */}
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
        data={visibleReports || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 70
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
  listItemDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
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
  gmId:{
    fontSize: Spacing.md,
    fontWeight: "600",
    color: Colors.light.blue,
    backgroundColor: Colors.light.blueBG,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs
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
});
