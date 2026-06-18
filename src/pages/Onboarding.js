import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Button } from '../components/Button';

const { width } = Dimensions.get('window');

export default function Onboarding({ onLogin, onGetStarted }) {
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.logoText}>Food<Text style={{color: theme.colors.green}}>Forward</Text></Text>
        </Animated.View>

        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.heroEmoji}>🥗</Text>
          <Text style={styles.heroTitle}>Share food,{"\n"}<Text style={{color: '#4ade80'}}>change lives</Text></Text>
          <Text style={styles.heroSub}>Join thousands helping reduce food waste in your neighbourhood.</Text>
        </Animated.View>

        <Animated.View style={[styles.ctaSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Button 
            variant="primary" 
            onPress={onGetStarted}
            style={styles.roleBtn}
          >
            🚀  Get Started
          </Button>
          <View style={{height: 12}} />
          <Button 
            variant="secondary" 
            onPress={onLogin}
            style={styles.roleBtn}
          >
            🤝  Sign In
          </Button>
          
          <Pressable onPress={onLogin}>
            <Text style={styles.loginPrompt}>
              Already have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1f14',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
  },
  orb1: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(45, 158, 95, 0.15)',
    top: -50,
    left: -50,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    bottom: 100,
    right: -50,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.green,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSection: {
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 280,
  },
  ctaSection: {
    paddingBottom: 20,
  },
  roleBtn: {
    width: '100%',
  },
  loginPrompt: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  loginLink: {
    color: '#4ade80',
    fontWeight: '700',
  }
});
