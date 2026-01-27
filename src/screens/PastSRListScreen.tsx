import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import CustomLoader from "../components/CustomLoader";
import { usePastSRList } from "../hooks/usePastSRList";

type ReportsNavigationProp = NativeStackNavigationProp<ReportsStackParamList>;


export default function PastSRListScreen() {
  const navigation = useNavigation<ReportsNavigationProp>();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;
  const isInitialLoad = React.useRef(true);
  const hasMounted = React.useRef(false);


  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [reports, setReports] = useState<ServiceReportRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { data, isLoading, error } = usePastSRList(currentPage);
 
  const filteredReports = reports.filter((report: any) => {
    const matchesSearch =
      (report.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.mcSerialNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.equipmentTypeName || "").toLowerCase().includes(searchQuery.toLowerCase());
  
    const matchesFilter = filterStatus ? report.status === filterStatus : true;
    return matchesSearch && matchesFilter;
  });
  
  useEffect(() => {
    if (!data) return;
  
    setReports(prev =>
      currentPage === 1 ? data : [...prev, ...data]
    );
  
    if (data.length === 0) {
      setHasMore(false);
    }
  
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
  
  const isFirstLoading =
  isLoading && isInitialLoad.current;

  const hasData =
    !isLoading && reports.length > 0;

  const isEmpty =
    !isLoading && reports.length === 0;


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const renderFooter = () => {
    if (!isFetchingMore || !hasMore || error) return null;
  
    return (
      <View style={{ paddingVertical: 20 }}>
        <CustomLoader size="large" color={colors.primary} />
      </View>
    );
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
