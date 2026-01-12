import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServiceReportsListScreen from "../screens/ServiceReportsListScreen";
// import ServiceReportDetailScreen from "@/screens/ServiceReportDetailScreen";
import ServiceReportFormScreen from "../screens/ServiceReportFormScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";

export type ReportsStackParamList = {
  ServiceReportsList: undefined;
  ServiceReportDetail: { id: string };
  ServiceReportForm: { report?: any };

};

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export default function ReportsStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ServiceReportsList"
        component={ServiceReportsListScreen}
        options={{ headerTitle: "Service Reports" }}
      />
      {/* <Stack.Screen
        name="ServiceReportDetail"
        component={ServiceReportDetailScreen}
        options={{ headerTitle: "Report Detail" }}
      />*/}
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
