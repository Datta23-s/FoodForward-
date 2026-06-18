import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Camera as CameraIcon,
  LogOut,
  MapPin,
  User,
  Award,
  Heart,
  ChevronRight,
  Phone,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { GlassView } from '../components/GlassView';
import { useTheme } from '../context/ThemeContext';
import { db } from '../utils/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function Profile({ onBack }) {
  const { user, role, logout, setUser } = useAppContext();
  const { colors, isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUri, setAvatarUri] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
  );
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    location: user?.location || 'Pune, MH',
    bio: user?.bio || 'Helping reduce food waste one meal at a time.',
    phone: user?.phone || '',
  });

  const [saving, setSaving] = useState(false);

  const styles = makeStyles(colors);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = { ...user, ...formData, avatar: avatarUri };
      setUser(updatedUser);

      // Persist to Firestore
      if (user?.uid) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            name: formData.name,
            bio: formData.bio,
            location: formData.location,
            phone: formData.phone,
            avatar: avatarUri,
            role: role,
          },
          { merge: true }
        );
      }
      setIsEditing(false);
      Alert.alert('Saved ✅', 'Your profile has been updated!');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile. Check your connection.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const renderStat = (label, value, icon, color) => (
    <GlassView style={styles.statCard} intensity={10}>
      <View style={[styles.statIcon, { backgroundColor: color + '25' }]}>{icon}</View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </GlassView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ChevronLeft size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        {/* Dark mode toggle */}
        <Pressable style={styles.themeBtn} onPress={toggleTheme}>
          {isDark ? <Sun size={22} color={colors.amber} /> : <Moon size={22} color={colors.ink} />}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar + role badge */}
        <View style={styles.profileHero}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <Pressable style={styles.cameraBtn} onPress={pickImage}>
                <CameraIcon size={16} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{role?.toUpperCase() || 'USER'}</Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editSection}>
              <TextInput
                style={styles.nameInput}
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholder="Name"
                placeholderTextColor={colors.inkMute}
              />
              <TextInput
                style={styles.bioInput}
                value={formData.bio}
                onChangeText={(t) => setFormData({ ...formData, bio: t })}
                placeholder="Bio"
                placeholderTextColor={colors.inkMute}
                multiline
              />
              <View style={styles.phoneRow}>
                <Phone size={16} color={colors.inkMute} />
                <TextInput
                  style={[styles.nameInput, { flex: 1, marginLeft: 8 }]}
                  value={formData.phone}
                  onChangeText={(t) => setFormData({ ...formData, phone: t })}
                  placeholder="+91 00000 00000"
                  placeholderTextColor={colors.inkMute}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.editActions}>
                <Button variant="ghost" onPress={() => setIsEditing(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button loading={saving} onPress={handleSave} style={{ flex: 1 }}>
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.infoSection}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={colors.inkMute} />
                <Text style={styles.locationText}>{user?.location || 'Pune, MH'}</Text>
              </View>
              {user?.phone ? (
                <Pressable
                  style={styles.locationRow}
                  onPress={() => Linking.openURL(`tel:${user.phone}`)}
                >
                  <Phone size={14} color={colors.inkMute} />
                  <Text style={[styles.locationText, { color: colors.blue }]}>{user.phone}</Text>
                </Pressable>
              ) : null}
              <Text style={styles.profileBio}>{user?.bio || 'Helping reduce food waste one meal at a time.'}</Text>
              <Button
                variant="secondary"
                size="small"
                onPress={() => setIsEditing(true)}
                style={styles.editBtn}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {renderStat('Meals Saved', user?.impact || 0, <Heart size={20} color={colors.red} />, colors.red)}
          {renderStat('Impact Score', (user?.impact || 0) * 10 + 'pts', <Award size={20} color={colors.amber} />, colors.amber)}
        </View>



        {/* Account Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {/* Dark mode toggle row */}
          <Pressable style={styles.menuItem} onPress={toggleTheme}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: isDark ? '#1c1a00' : '#fef3c7' }]}>
                {isDark ? <Sun size={20} color={colors.amber} /> : <Moon size={20} color={colors.inkMute} />}
              </View>
              <Text style={styles.menuText}>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
            </View>
            <ChevronRight size={20} color={colors.inkMute} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={logout}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                <LogOut size={20} color={colors.red} />
              </View>
              <Text style={[styles.menuText, { color: colors.red }]}>Logout</Text>
            </View>
            <ChevronRight size={20} color={colors.inkMute} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 30,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surface2,
    },
    themeBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surface2,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
    scrollContent: { padding: 20 },
    profileHero: { alignItems: 'center', marginBottom: 30 },
    avatarSection: { marginBottom: 16 },
    avatarWrapper: { position: 'relative' },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: colors.surface,
      elevation: 8,
    },
    cameraBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.green,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleBadge: {
      backgroundColor: colors.ink,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      marginTop: -10,
      alignSelf: 'center',
    },
    roleBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    infoSection: { alignItems: 'center' },
    profileName: { fontSize: 24, fontWeight: '800', color: colors.ink },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    locationText: { color: colors.inkMute, fontSize: 14, fontWeight: '600' },
    profileBio: {
      textAlign: 'center',
      color: colors.inkSoft,
      marginTop: 12,
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    editBtn: { marginTop: 20, paddingHorizontal: 30 },
    editSection: { width: '100%', gap: 12 },
    nameInput: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.ink,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 4,
      backgroundColor: 'transparent',
    },
    bioInput: {
      fontSize: 14,
      color: colors.inkSoft,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      minHeight: 80,
      backgroundColor: colors.inputBg,
    },
    phoneRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
    editActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface2,
      padding: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 18, fontWeight: '800', color: colors.ink },
    statLabel: { fontSize: 10, fontWeight: '700', color: colors.inkMute, textTransform: 'uppercase' },
    menuSection: { marginBottom: 30 },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft },
  });
