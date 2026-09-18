import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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

import { CustomButton } from "../components/CustomButton";
import { formatDate } from "../utils/formatDate";
import { SendInReturnStackParamList } from "../navigation/SendInReturnStackNavigator";
import { useSendInReturnList } from "../hooks/useSendInReturnList";
import { SendInReturnRecord } from "../types/sendInReturn";

type SendInReturnNavigationProp = NativeStackNavigationProp<SendInReturnStackParamList>;


export default function SendInReturnListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<SendInReturnNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;
  const isInitialLoad = React.useRef(true);
  const hasMounted = React.useRef(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [sendInReturn, setSendInReturn] = useState<SendInReturnRecord[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { data, isLoading, error, refetch } = useSendInReturnList(currentPage);  
    
  useEffect(() => {
    if (!Array.isArray(data?.data)) return;
  
    const newItems = data.data;
  
    setSendInReturn(prev =>
      currentPage === 1
        ? newItems
        : [...prev, ...newItems]
    );
  
    const pagination = data.pagination;
  
    setHasMore(
      pagination.current_page < pagination.last_page
    );
  
    setIsFetchingMore(false);
    isInitialLoad.current = false;
  }, [data, currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [searchQuery, filterStatus]);
  
  useFocusEffect(
    useCallback(() => {
      if (hasMounted.current) {
        isInitialLoad.current = true;
        setCurrentPage(1);
        setHasMore(true);
      } else {
        hasMounted.current = true;
      }
    }, [])
  );
  
  
  const loadMore = () => {
    if (
      isInitialLoad.current ||
      isFetchingMore ||
      isLoading ||
      !hasMore ||
      !data  
    ) {
      return;
    }
  
    setIsFetchingMore(true);
    setCurrentPage(prev => prev + 1);
  };


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


  const filteredReports = (sendInReturn ?? []).filter(
  
    (sendInReturn: any) => {
      const query = normalizeText(searchQuery);

      const matchesSearch =
  
        (sendInReturn.serial_no || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
  
        (sendInReturn.equipment_type || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||

        normalizeText(String(sendInReturn.inspection_id || "")).includes(query);

        // STATUS FILTER
        const matchesStatus =
        !filterStatus || sendInReturn.status === filterStatus;

        // DATE FILTER
        
        const reportDate = parseDate(sendInReturn.send_in?.date);

        const from =
          fromDate
            ? reportDate! >= parseDate(fromDate)!
            : true;

        const to =
          toDate
            ? reportDate! <= parseDate(toDate)!
            : true;
      
      return (
        matchesSearch && from && to && matchesStatus
      );
    }
  );

  const isFirstLoading =
  isLoading && sendInReturn.length === 0;

  const hasData =
    !isLoading && sendInReturn.length > 0;

  const isEmpty =
    !isLoading && sendInReturn.length === 0;


  const getStatusLabel = (status: string | number) => {
    switch (status) {
      case 1:
        return "Send In";
  
      case 2:
        return "Completed";
  
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string | number) => {
    switch (status) {
      case 1:
        return colors.warning; // green
  
      case 2:
        return colors.success; // red
  
      default:
        return colors.success;
    }
  };

  const renderFooter = () => {
    if (!isFetchingMore || !hasMore || error) return null;
  
    return (
      <View style={{ paddingVertical: 20 }}>
        <CustomLoader size="large" color={colors.primary} />
      </View>
    );
  };
  

  const renderItem = ({ item }: { item: SendInReturnRecord }) => {
    return(
      <Card
        elevation={1}
        style={styles.listItem}
        onPress={() => navigation.navigate("SendInReturnDetail", { sendInReturn: item, sendIn_id: item.inspection_id, readOnly: false })}
      >
        <View style={styles.listItemHeader}>
          <View style={styles.listItemInfo}>
            <ThemedText type="small" numberOfLines={1} style={styles.srId}>
              {item.inspection_id}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(item.status) + "20",
              },
            ]}
          >
            <ThemedText
              type="small"
              style={[styles.statusText, { color: getStatusColor(item.status) }]}
            >
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.listItemHeader}>
          <View>
        
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
              {formatDate(
                item.status == 1
                  ? item.send_in?.date
                  : item.return?.date
              )}            
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: 6 }}>
              {item.status == 1
                ? item.send_in?.time
                : item.return?.time
              }
            </ThemedText>
          </View>
        </View>
        {
          item.status == "1" &&

          <View style={styles.listItemActions}>
            <CustomButton
              onPress={() =>
                navigation.navigate("SendInReturnForm", { sendInReturn: item, sendIn_id: item.inspection_id, readOnly: false, flag: "needToReturn" })
              }
              style={styles.offHireButton}
            >
              Need to Return
            </CustomButton>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
              onPress={() =>
                navigation.navigate("SendInReturnForm", { sendInReturn: item, sendIn_id: item.inspection_id, readOnly: false, flag: "needToUpdate"})
              }
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </Pressable>
          </View>
        }
      </Card>
    )
}

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={60} color={colors.textSecondary} />
      <ThemedText type="h3" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Send In/Return
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
        Tap the + button to create your first Send In/Return
      </ThemedText>
    </View>
  );

  
  const FilterChip = ({ label, value }: { label: string; value: number | null }) => (
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
            placeholder="Search sendIn / return..."
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
        <FilterChip label="Send In" value={1} />
        <FilterChip label="Completed" value={2} />
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
          onEndReached={loadMore}
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
        onPress={() => navigation.navigate("SendInReturnForm", {})}
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
    alignItems: "center",
  },
  offHireButton: {
    width: 150,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
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
