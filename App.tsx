import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './src/store';
import Toast from 'react-native-toast-message';
import { DataProvider } from './src/contexts/DataContext';
import { KeyboardProvider } from 'react-native-keyboard-controller'; 

const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <DataProvider>
            <KeyboardProvider>
              <NavigationContainer>
                <RootNavigator />
                <Toast />
              </NavigationContainer>
             </KeyboardProvider> 
          </DataProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
