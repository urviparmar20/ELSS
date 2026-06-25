import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useScreenOptions } from "../hooks/useScreenOptions";
import DrawerMenuButton from "../components/DrawerMenuButton";
import OnOffHireListScreen from "../screens/OnOffHireListScreen";
import PastOnOffHireListScreen from "../screens/PastOnOffHireListScreen";
import OnOffHireFormScreen from "../screens/OnOffHireFormScreen";
import OnOffHireDetailScreen from "../screens/OnOffHireDetailScreen";


export type ONOffHireStackParamList = {
  OnOffHireList: undefined;
  PastOnOffHire: undefined;
  OnOffHireForm: {
    onOffHire?: any;
    hire_id?: string;
    readOnly?: boolean;
  } | undefined;
  OnOffHireDetail: {
    onOffHire?: any;
    hire_id?: number;
    readOnly?: boolean;
  } | undefined;
};

const Stack = createNativeStackNavigator<ONOffHireStackParamList>();

export default function OnOffHireStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="OnOffHireList"
        component={OnOffHireListScreen}
        options={{ headerTitle: "On/Off Hire",         
          headerLeft: () => <DrawerMenuButton />,
        }} 
      />
      {/* Drawer entry */}
      <Stack.Screen
        name="PastOnOffHire"
        component={PastOnOffHireListScreen}
        options={{
          title: "Past On/Off Hire",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <Stack.Screen
        name="OnOffHireForm"
        component={OnOffHireFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New On/Off Hire",
        }}
      />
      <Stack.Screen
        name="OnOffHireDetail"
        component={OnOffHireDetailScreen}
      />
    </Stack.Navigator>
  );
}
