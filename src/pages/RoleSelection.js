import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, ArrowRight, Heart, ShoppingBag, Building2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RoleSelection({ onBack, onSelectRole, authMode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const roles = [
    {
      id: 'donor',
      title: 'I want to Donate',
      description: 'Share surplus food from your home, cafe, or events with those in need.',
      icon: <Heart size={32} color={theme.colors.green} />,
      color: theme.colors.green,
      bg: theme.colors.greenLight,
    },
    {
      id: 'receiver',
      title: 'I want to Receive',
      description: 'Find fresh, surplus food nearby and help reduce local food waste.',
      icon: <ShoppingBag size={32} color={theme.colors.blue} />,
      color: theme.colors.blue,
      bg: theme.colors.blueLight,
    },
    {
      id: 'ngo',
      title: 'NGO / Organisation',
      description: 'Batch-claim food on behalf of shelters, charities, or community kitchens.',
      icon: <Building2 size={32} color={'#8b5cf6'} />,
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ChevronLeft size={24} color={theme.colors.ink} />
        </Pressable>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          How would you like to participate in the {authMode === 'login' ? 'login' : 'registration'}?
        </Text>

        <View style={styles.rolesGrid}>
          {roles.map((role) => (
            <Pressable 
              key={role.id} 
              style={[styles.roleCard, { backgroundColor: role.bg }]}
              onPress={() => onSelectRole(role.id)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#fff' }]}>
                {role.icon}
              </View>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleTitle, { color: role.color }]}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              <ArrowRight size={20} color={role.color} style={styles.arrow} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>You can always switch roles later from your profile settings.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.inkMute,
    marginTop: 8,
    lineHeight: 24,
    marginBottom: 40,
  },
  rolesGrid: {
    gap: 20,
  },
  roleCard: {
    padding: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  roleInfo: {
    flex: 1,
    paddingRight: 20,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    color: theme.colors.inkSoft,
    lineHeight: 18,
    opacity: 0.7,
  },
  arrow: {
    position: 'absolute',
    right: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.inkMute,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});
