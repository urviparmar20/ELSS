import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Images } from '../../assets/images';
import CustomLoader from '../components/CustomLoader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
  isAuthenticated: boolean;
};

const SplashScreen: React.FC<Props> = () => {
 
  return (
    <View style={styles.container}>
      <Image source={Images.bgLogin} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.loaderContainer}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
        <CustomLoader />
      </View>
      <Text style={styles.versionText}>v1.0.0</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 200, height: 80, marginBottom: 16 },
  versionText: { position: 'absolute', bottom: 12, width: '100%', textAlign: 'center', fontSize: 10, color: '#9E9E9E' },
});
