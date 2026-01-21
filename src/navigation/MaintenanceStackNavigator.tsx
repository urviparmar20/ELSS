import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GMListScreen from "../screens/GMListScreen";
// import MaintenanceDetailScreen from "../screens/MaintenanceDetailScreen";
import GMFormScreen from "../screens/GMFormScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";

export type MaintenanceStackParamList = {
  GMList: undefined;
  GMDetail: { id: string };
  GMForm: { id?: string };
};

const Stack = createNativeStackNavigator<MaintenanceStackParamList>();

export default function MaintenanceStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="GMList"
        component={GMListScreen}
        options={{ headerTitle: "Maintenance" }}
      />
      {/* <Stack.Screen
        name="MaintenanceDetail"
        component={MaintenanceDetailScreen}
        options={{ headerTitle: "Maintenance Detail" }}
      /> */}
      <Stack.Screen
        name="GMForm"
        component={GMFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Maintenance",
        }}
      />
    </Stack.Navigator>
  );
}
