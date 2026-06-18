import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

export const Button = ({ children, onPress, variant = 'primary', size = 'default', style, textStyle, disabled = false, loading = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[styles.container, size === 'small' && styles.containerSmall, style, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.btn,
          styles[`btn_${variant}`] || styles.btn_primary,
          size === 'small' && styles.btnSmall,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'primary' ? '#ffffff' : theme.colors.green} />
        ) : (
          <Text style={[styles.text, size === 'small' && styles.textSmall, styles[`text_${variant}`] || styles.text_primary, textStyle]}>{children}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 52,
  },
  containerSmall: {
    height: 40,
  },
  btn: {
    flex: 1,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  btnSmall: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  btn_primary: {
    backgroundColor: theme.colors.green,
  },
  btn_secondary: {
    backgroundColor: theme.colors.blueLight,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  btn_ghost: {
    backgroundColor: 'rgba(45, 158, 95, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 158, 95, 0.25)',
  },
  btn_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.green,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 12,
  },
  text_primary: {
    color: '#ffffff',
  },
  text_secondary: {
    color: theme.colors.blue,
  },
  text_ghost: {
    color: theme.colors.green,
  },
  text_outline: {
    color: theme.colors.green,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  }
});
