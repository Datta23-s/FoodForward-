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
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { ChevronLeft, Mail, Lock, User, Building2, Phone } from 'lucide-react-native';
import { auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function Register({ onBack, onLogin, selectedRole }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  // NGO-specific fields
  const [orgName, setOrgName] = useState('');
  const [regNumber, setRegNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const { colors } = useTheme();

  const isNgo = selectedRole === 'ngo';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (isNgo && !orgName) {
      Alert.alert('Error', 'Please enter your organisation name');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: selectedRole || 'donor',
        phone,
        createdAt: new Date().toISOString(),
        impact: 0,
        streak: 0,
        // NGO extras
        ...(isNgo && { orgName, regNumber }),
      });
      // AppContext onAuthStateChanged picks up and routes automatically
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  const roleLabel = selectedRole === 'ngo'
    ? 'NGO / Organisation'
    : selectedRole === 'donor'
    ? 'Donor'
    : 'Receiver';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={onBack}>
              <ChevronLeft size={24} color={colors.ink} />
            </Pressable>
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Join FoodForward</Text>
              <Text style={styles.subtitle}>Create your <Text style={{ color: colors.green, fontWeight: '800' }}>{roleLabel}</Text> account.</Text>
            </View>

            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color={colors.inkMute} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={colors.inkMute}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* NGO-specific fields */}
              {isNgo && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Organisation Name <Text style={{ color: colors.red }}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Building2 size={20} color={colors.inkMute} style={{ marginRight: 12 }} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Helping Hands Trust"
                        placeholderTextColor={colors.inkMute}
                        value={orgName}
                        onChangeText={setOrgName}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Registration Number (optional)</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, { marginLeft: 0 }]}
                        placeholder="NGO Reg. No."
                        placeholderTextColor={colors.inkMute}
                        value={regNumber}
                        onChangeText={setRegNumber}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number (optional)</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={colors.inkMute} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.inkMute}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={colors.inkMute} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.inkMute}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={colors.inkMute} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.inkMute}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <Button onPress={handleRegister} loading={loading} style={styles.registerBtn}>
                Create Account
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={onLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: { padding: 20 },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
    titleSection: { marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: colors.inkMute, marginTop: 8, lineHeight: 24 },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginLeft: 4 },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    input: { flex: 1, height: 56, fontSize: 16, color: colors.ink },
    registerBtn: { marginTop: 10 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
    },
    footerText: { fontSize: 15, color: colors.inkMute },
    loginLink: { fontSize: 15, color: colors.green, fontWeight: '800' },
  });
