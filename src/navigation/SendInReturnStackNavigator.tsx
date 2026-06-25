import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useScreenOptions } from "../hooks/useScreenOptions";
import DrawerMenuButton from "../components/DrawerMenuButton";
import SendInReturnListScreen from "../screens/SendInReturnListScreen";
import PastSendInReturnListScreen from "../screens/PastSendInReturnListScreen";
import SendInReturnFormScreen from "../screens/SendInReturnFormScreen";
import SendInReturnDetailScreen from "../screens/SendInReturnDetailScreen";
export type SendInReturnStackParamList = {
  SendInReturnList: undefined;
  PastSendInReturn: undefined;
  SendInReturnForm: {
    report?: any;
    gm_id?: string;
    readOnly?: boolean;
  } | undefined;
  SendInReturnDetail: {
    report?: any;
    gm_id?: string;
    readOnly?: boolean;
  } | undefined;
};

const Stack = createNativeStackNavigator<SendInReturnStackParamList>();

export default function SendInReturnStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SendInReturnList"
        component={SendInReturnListScreen}
        options={{ headerTitle: "On/Off Hire",         
          headerLeft: () => <DrawerMenuButton />,
        }} 
      />
      {/* Drawer entry */}
      <Stack.Screen
        name="PastSendInReturn"
        component={PastSendInReturnListScreen}
        options={{
          title: "Past On/Off Hire",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <Stack.Screen
        name="SendInReturnForm"
        component={SendInReturnFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New On/Off Hire",
        }}
      />
      <Stack.Screen
        name="SendInReturnDetail"
        component={SendInReturnDetailScreen}
      />
    </Stack.Navigator>
  );
}
