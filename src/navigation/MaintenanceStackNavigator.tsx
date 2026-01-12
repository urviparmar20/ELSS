import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaintenanceListScreen from "../screens/MaintenanceListScreen";
// import MaintenanceDetailScreen from "../screens/MaintenanceDetailScreen";
import MaintenanceFormScreen from "../screens/MaintenanceFormScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  MaintenanceDetail: { id: string };
  MaintenanceForm: { id?: string };
};

const Stack = createNativeStackNavigator<MaintenanceStackParamList>();

export default function MaintenanceStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MaintenanceList"
        component={MaintenanceListScreen}
        options={{ headerTitle: "Maintenance" }}
      />
      {/* <Stack.Screen
        name="MaintenanceDetail"
        component={MaintenanceDetailScreen}
        options={{ headerTitle: "Maintenance Detail" }}
      /> */}
      <Stack.Screen
        name="MaintenanceForm"
        component={MaintenanceFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Maintenance",
        }}
      />
    </Stack.Navigator>
  );
}
