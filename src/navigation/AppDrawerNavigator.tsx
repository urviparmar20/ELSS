import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "./MainTabNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import PastGMListScreen from "../screens/PastGmListScreen";
import PastSRListScreen from "../screens/PastSRListScreen";

export type AppDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  PastDO: undefined;
  PastRR: undefined;
  PastSR: undefined;
  PastGM: undefined;
  PastOnOffHire: undefined;
  SavedJobs: undefined;
  Chats: undefined;
  Logout: undefined;
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
        component={PastSRListScreen}
        options={{ title: "Past SR" }}
      />
      <Drawer.Screen
        name="PastGM"
        component={PastGMListScreen}
        options={{ title: "Past GM" }}
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
