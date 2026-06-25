import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { useTheme } from "../hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

import CustomLoader from "../components/CustomLoader";
import { FormDatePicker } from "../components/FormDatePicker";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useOnOffHires } from "../hooks/useOnOffHires";
import { ONOffHireStackParamList } from "../navigation/OnOffHireStackNavigator";
import { OnOffHireRecord } from "../types/onOffHire";

type OnOffHireNavigationProp = NativeStackNavigationProp<ONOffHireStackParamList>;


export default function OnOffHireListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<OnOffHireNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;
  const isInitialLoad = React.useRef(true);
  const hasMounted = React.useRef(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [onOffHires, setOnOffHires] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { data, isLoading, error, refetch } = useOnOffHires(currentPage);  

  useEffect(() => {
    if (Array.isArray(data?.data?.onHires)) {
      setOnOffHires(data.data.onHires);
    }
  }, [data]);



  const normalizeText = (text: string) =>
  text
    .replace(/–/g, "-")
    .trim()
    .toLowerCase();

  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
  
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day).setHours(0, 0, 0, 0);
    }
  
    return new Date(dateStr).setHours(0, 0, 0, 0);
  };

  const filteredReports = (onOffHires ?? []).filter(
    (hire: any) => {
      const query = normalizeText(searchQuery);

      const matchesSearch =
        (hire.company_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
  
        (hire.serial_no || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) 
        //   ||
  
        // (hire.equipment_type || "")
        //   .toLowerCase()
        //   .includes(searchQuery.toLowerCase()) 
          // ||

        // normalizeText(String(hire.gm_id || "")).includes(query);

        // DATE FILTER
        
        const reportDate = parseDate(hire.date);

        const from =
          fromDate
            ? reportDate! >= parseDate(fromDate)!
            : true;

        const to =
          toDate
            ? reportDate! <= parseDate(toDate)!
            : true;
      
      return (
        matchesSearch && from && to 
      );
    }
  );

  const isFirstLoading =
  isLoading && onOffHires.length === 0;

  const hasData =
    !isLoading && onOffHires.length > 0;

  const isEmpty =
    !isLoading && onOffHires.length === 0;


    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
    
      let date: Date;
    
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        date = new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );
      } else {
        date = new Date(dateStr);
      }
    
      if (isNaN(date.getTime())) {
        return dateStr;
      }
    
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

  const renderFooter = () => {
    if (!isFetchingMore || !hasMore || error) return null;
  
    return (
      <View style={{ paddingVertical: 20 }}>
        <CustomLoader size="large" color={colors.primary} />
      </View>
    );
  };
  

  const renderItem = ({ item }: { item: OnOffHireRecord }) => (
    <Card
      elevation={1}
      style={styles.listItem}
      onPress={() => navigation.navigate("OnOffHireDetail", { onOffHire: item, hire_id: item.id, readOnly: false })}
    >
      <View style={styles.listItemHeader}>
        <View>
          <ThemedText type="h4" numberOfLines={1}>
            {item.company_name}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {item.serial_no}
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
            {formatDate(item.date)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.listItemActions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
          // onPress={() =>
          //   navigation.navigate("ServiceReportForm", { report: item, sr_id: item.raw?.sr_id, readOnly: false })
          // }
          
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
        No On/Off Hires
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
        Tap the + button to create your first On/Off hire
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
            placeholder="Search on/off hire..."
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
      
      {/* FULL SCREEN LOADER (initial load only) */}
      {isFirstLoading && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <CustomLoader size="large" color={colors.primary} />
        </View>
      )}

      {/* EMPTY STATE (after load, no data) */}
      {isEmpty && renderEmptyState()}

      {/* LIST */}
      {hasData && (
        <FlatList
          data={filteredReports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing["5xl"] },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.secondary, bottom: tabBarHeight + Spacing.xl },
        ]}
        onPress={() => navigation.navigate("OnOffHireForm", {})}
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
  srId:{
    fontSize: Spacing.md,
    fontWeight: 600,
    color: Colors.light.blue
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
    marginRight: Spacing.md,
    backgroundColor: Colors.light.blueBG,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
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
