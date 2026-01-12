import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';


const HomeScreen: React.FC = () => {

  return (
    <View style={styles.container}>
      <Text>v1.0.0</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  
});
