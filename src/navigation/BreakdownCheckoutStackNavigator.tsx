import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../hooks/useScreenOptions";
import DrawerMenuButton from "../components/DrawerMenuButton";
import BDCListScreen from "../screens/BDCListScreen";
import BDCFormScreen from "../screens/BDCFormScreen";

export type BDCStackParamList = {
  BDCList: undefined;
  BDCForm: {
    report?: any;
    bdc_id?: string;
    readOnly?: boolean;
  } | undefined;
};

const Stack = createNativeStackNavigator<BDCStackParamList>();

export default function BreakdownCheckoutStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="BDCList"
        component={BDCListScreen}
        options={{ headerTitle: "Breakdown Checkout",         
          headerLeft: () => <DrawerMenuButton />,
        }} 
      />
      <Stack.Screen
        name="BDCForm"
        component={BDCFormScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Breakdown Checkout",
        }}
      />
    </Stack.Navigator>
  );
}
