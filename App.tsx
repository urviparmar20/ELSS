import React, { useEffect } from 'react';
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './src/store';
import Toast from 'react-native-toast-message';
import { KeyboardProvider } from 'react-native-keyboard-controller'; 

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <NavigationContainer>
                <RootNavigator />
                <Toast />
              </NavigationContainer>
             </KeyboardProvider> 
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
