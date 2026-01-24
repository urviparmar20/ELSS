import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  Auth: undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showSplash, setShowSplash] = useState(true);

  // Hide splash after first app load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Show splash only on first app load */}
      {/* {showSplash && <Stack.Screen name="Splash">
        {(props) => <SplashScreen {...props} isAuthenticated={isAuthenticated} />}
      </Stack.Screen>} */}

      {/* After splash or if user logged out, show the main screens */}
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />

        // <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
