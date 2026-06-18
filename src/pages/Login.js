import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Animated, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { auth } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAppContext } from '../context/AppContext';

export default function Login({ onBack, onRegister, selectedRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();

  // Animation values
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // In a real app with Firebase project set up, this would work.
      // For now, if config is placeholder, we catch the error but allow simulation for UI testing.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Success! AppContext's onAuthStateChanged listener will automatically 
      // detect this and redirect the user, so we don't manually call login() here.
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={theme.colors.ink} />
          </Pressable>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in as {selectedRole || 'user'} to continue saving food.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={theme.colors.inkMute} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.inkMute}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={theme.colors.inkMute} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.inkMute}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color={theme.colors.inkMute} /> : <Eye size={20} color={theme.colors.inkMute} />}
                </Pressable>
              </View>
              <Pressable style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <Button 
              onPress={handleLogin} 
              loading={loading}
              style={styles.loginBtn}
            >
              Sign In
            </Button>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={[styles.socialBtn, {flex: 1}]} onPress={() => {
                Alert.alert(
                  "Google Sign-In",
                  "Google Sign-In requires a production APK build. Please use Email/Password to sign in for now.",
                  [{ text: "OK" }]
                );
              }}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
                <Text style={styles.socialText}>Continue with Google</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={onRegister}>
              <Text style={styles.registerLink}>Register</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
  titleSection: {
    marginBottom: 40,
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
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: theme.colors.ink,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    color: theme.colors.green,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.inkMute,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  socialText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.inkMute,
  },
  registerLink: {
    fontSize: 15,
    color: theme.colors.green,
    fontWeight: '800',
  }
});
