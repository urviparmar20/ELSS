import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "./MainTabNavigator";
import ReportsStackNavigator from "./ReportsStackNavigator";
import { NavigatorScreenParams } from "@react-navigation/native";
import type { ReportsStackParamList } from "./ReportsStackNavigator";
import MaintenanceStackNavigator from "./MaintenanceStackNavigator";
import type { MaintenanceStackParamList } from "./MaintenanceStackNavigator";
import BreakdownCheckoutStackNavigator from "./BreakdownCheckoutStackNavigator";
import type { BDCStackParamList } from "./BreakdownCheckoutStackNavigator";



export type AppDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  PastDO: undefined;
  PastRR: undefined;
  PastSR: NavigatorScreenParams<ReportsStackParamList>;
  PastGM: NavigatorScreenParams<MaintenanceStackParamList>;
  PastOnOffHire: undefined;
  SavedJobs: undefined;
  Chats: undefined;
  Logout: undefined;
  BDCList: NavigatorScreenParams<BDCStackParamList>;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabNavigator}
        options={{ title: "Home",          
        headerShown: false,
      }}
      />
      {/*<Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
       <Drawer.Screen
        name="PastDO"
        component={ProfileScreen}
        options={{ title: "Past DO" }}
      /> 
      <Drawer.Screen
        name="PastRR"
        component={ProfileScreen}
        options={{ title: "Past RR" }}
      />*/}
      <Drawer.Screen
        name="PastSR"
        component={ReportsStackNavigator}
        options={{
          title: "Past SR",
          headerShown: false,
        }}
        initialParams={{
          screen: "PastSRList",
        }}
      />
      {/* <Drawer.Screen
        name="PastGM"
        component={PastGMListScreen}
        options={{ title: "Past GM" }}
      /> */}
      <Drawer.Screen
        name="PastGM"
        component={MaintenanceStackNavigator}
        options={{
          title: "Past GM",
          headerShown: false,
        }}
        initialParams={{
          screen: "PastGMList",
        }}
      />

      <Drawer.Screen
        name="BDCList"
        component={BreakdownCheckoutStackNavigator}
        options={{
          title: "Breakdown Checkout",
          headerShown: false,
        }}
        initialParams={{
          screen: "BDCList",
        }}
      />
      {/* <Drawer.Screen
        name="PastOnOffHire"
        component={ProfileScreen}
        options={{ title: "Past On/Off Hire" }}
      />
      <Drawer.Screen
        name="SavedJobs"
        component={ProfileScreen}
        options={{ title: "Saved Jobs" }}
      />

      <Drawer.Screen
        name="Chats"
        component={ProfileScreen}
        options={{ title: "Chats" }}
      /> 

      <Drawer.Screen
        name="Logout"
        component={ProfileScreen}
        options={{ title: "Logout" }}
      />*/}
    </Drawer.Navigator>
  );
}
