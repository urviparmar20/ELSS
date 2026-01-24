import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
// import EditProfileScreen from "@/screens/EditProfileScreen";
// import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import { useScreenOptions } from "../hooks/useScreenOptions";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
      {/* <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          presentation: "modal",
          headerTitle: "Edit Profile",
        }}
      />*/}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          presentation: "modal",
          headerTitle: "Change Password",
        }}
      /> 
    </Stack.Navigator>
  );
}
