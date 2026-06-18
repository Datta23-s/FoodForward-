import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const GlassView = ({ children, style, intensity = 20, shadow = 'sm' }) => {
  return (
    <View style={[
      styles.glassOuter, 
      theme.shadows[shadow],
      style
    ]}>
      <View style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: `rgba(255, 255, 255, ${intensity / 100})` },
      ]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassOuter: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  }
});
