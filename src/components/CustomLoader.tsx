import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';

interface LoaderProps {
  color?: string;
  size?: 'small' | 'large' | number;
  style?: ViewStyle;
}

const CustomLoader: React.FC<LoaderProps> = ({ color = 'red', size = 'large', style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
