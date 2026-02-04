import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GMListScreen from "../screens/GMListScreen";
import GMFormScreen from "../screens/GMFormScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";
import DrawerMenuButton from "../components/DrawerMenuButton";
import PastGMListScreen from "../screens/PastGmListScreen";

export type MaintenanceStackParamList = {
  GMList: undefined;
  PastGMList: undefined;
  GMForm: {
    report?: any;
    readOnly?: boolean;
  } | undefined;
};

const Stack = createNativeStackNavigator<MaintenanceStackParamList>();

export default function MaintenanceStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="GMList"
        component={GMListScreen}
        options={{ headerTitle: "Maintenance",         
          headerLeft: () => <DrawerMenuButton />,
        }} 
      />
      {/* Drawer entry */}
      <Stack.Screen
        name="PastGMList"
        component={PastGMListScreen}
        options={{
          title: "Past GM",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
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
