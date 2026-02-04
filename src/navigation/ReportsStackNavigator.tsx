import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServiceReportsListScreen from "../screens/ServiceReportsListScreen";
// import ServiceReportDetailScreen from "@/screens/ServiceReportDetailScreen";
import ServiceReportFormScreen from "../screens/ServiceReportFormScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";
import DrawerMenuButton from "../components/DrawerMenuButton";
import PastSRListScreen from "../screens/PastSRListScreen";

export type ReportsStackParamList = {
  ServiceReportsList: undefined;
  PastSRList: undefined;
  ServiceReportForm: {
    report?: any;
    readOnly?: boolean;
  } | undefined;
};

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export default function ReportsStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ServiceReportsList"
        component={ServiceReportsListScreen}
        options={{ headerTitle: "Service Reports",         
        headerLeft: () => <DrawerMenuButton />,
      }}
      />
      {/* Drawer entry */}
      <Stack.Screen
        name="PastSRList"
        component={PastSRListScreen}
        options={{
          title: "Past SR",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <Stack.Screen
        name="ServiceReportForm"
        component={ServiceReportFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Service Report",
        }}
      /> 
    </Stack.Navigator>
  );
}
