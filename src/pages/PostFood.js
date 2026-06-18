import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Image, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, Clock, Users, MapPin, CheckCircle2 } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import ConfettiCannon from 'react-native-confetti-cannon';

const CATEGORIES = ['Meals', 'Bakery', 'Fruits', 'Drinks', 'Packaged'];
const DIET_TAGS = ['Vegan', 'Non-Veg', 'Cooked', 'Packaged', 'Beverages', 'Gluten-Free'];

// Expiry quick-pick options (hours from now)
const EXPIRY_OPTIONS = [
  { label: '1 hr', hours: 1 },
  { label: '2 hrs', hours: 2 },
  { label: '4 hrs', hours: 4 },
  { label: '8 hrs', hours: 8 },
  { label: 'Tomorrow', hours: 24 },
];

function addHours(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export default function PostFood({ onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const { addListing } = useAppContext();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [formData, setFormData] = useState({
    title: '',
    quantity: '',
    expiryISO: addHours(4), // default: 4 hours from now
    expiryLabel: '4 hrs',
    type: 'Meals',
    tags: [],
    emoji: '🍱',
    image: null,
    lat: null,
    lng: null,
  });

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setFormData((prev) => ({
        ...prev,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }));
      setTempCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const pickImage = async (useGallery = false) => {
    let result;
    if (useGallery) {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera access to photograph the food.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    }
    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePost = () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing info', 'Please enter what you are sharing.');
      return;
    }
    addListing({
      ...formData,
      time: 'Posted just now',
      distance: '0.1 km',
      lat: formData.lat || 18.5204,
      lng: formData.lng || 73.8567,
    });
    setStep(3);
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.formStep}>
          {/* Photo */}
          <Pressable style={styles.photoUpload} onPress={() => pickImage(false)}>
            <View style={styles.uploadBox}>
              {formData.image ? (
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
              ) : (
                <>
                  <Camera size={40} color={colors.green} opacity={0.6} />
                  <Text style={styles.uploadText}>Tap to take a photo</Text>
                </>
              )}
            </View>
          </Pressable>
          <Button variant="ghost" size="small" onPress={() => pickImage(true)} style={{ marginTop: -12, marginBottom: 4 }}>
            Or Upload from Gallery
          </Button>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>What are you sharing?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Fresh Chicken Biryani"
              placeholderTextColor={colors.inkMute}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pillContainer}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setFormData({ ...formData, type: cat })}
                  style={[styles.pill, formData.type === cat && styles.pillActive]}
                >
                  <Text style={[styles.pillText, formData.type === cat && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Diet tags */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Diet Tags (select all that apply)</Text>
            <View style={styles.pillContainer}>
              {DIET_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.pill, formData.tags.includes(tag) && styles.pillTagActive]}
                >
                  <Text
                    style={[styles.pillText, formData.tags.includes(tag) && styles.pillTagTextActive]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button onPress={() => setStep(2)}>Continue →</Button>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.formStep}>
          {/* Quantity */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              <Users size={16} /> How many servings?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5 servings"
              placeholderTextColor={colors.inkMute}
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />
          </View>

          {/* Expiry quick-pick */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              <Clock size={16} /> Best Before (from now)
            </Text>
            <View style={styles.pillContainer}>
              {EXPIRY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      expiryISO: addHours(opt.hours),
                      expiryLabel: opt.label,
                    })
                  }
                  style={[
                    styles.pill,
                    formData.expiryLabel === opt.label && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      formData.expiryLabel === opt.label && styles.pillTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ fontSize: 12, color: colors.green, marginTop: 4, fontWeight: '600' }}>
              ⏰ Expires: {new Date(formData.expiryISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Pickup location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              <MapPin size={16} /> Pickup Location
            </Text>
            <Pressable style={styles.locationBox} onPress={() => setIsMapVisible(true)}>
              <Text style={styles.locationText}>
                {formData.lat ? `📍 Location pinned (${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)})` : 'Tap to drop map pin'}
              </Text>
            </Pressable>
          </View>

          <Modal visible={isMapVisible} animationType="slide">
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
              <View style={styles.mapHeader}>
                <Pressable onPress={() => setIsMapVisible(false)} style={styles.backBtn}>
                  <ChevronLeft size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.headerTitle}>Pin Pickup Location</Text>
              </View>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: formData.lat || 18.5204,
                  longitude: formData.lng || 73.8567,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={(e) => setTempCoords(e.nativeEvent.coordinate)}
              >
                {tempCoords && (
                  <Marker
                    coordinate={tempCoords}
                    draggable
                    onDragEnd={(e) => setTempCoords(e.nativeEvent.coordinate)}
                  />
                )}
              </MapView>
              <View style={styles.mapFooter}>
                <Button
                  onPress={() => {
                    if (tempCoords) {
                      setFormData({ ...formData, lat: tempCoords.latitude, lng: tempCoords.longitude });
                    }
                    setIsMapVisible(false);
                  }}
                >
                  Confirm Location
                </Button>
              </View>
            </SafeAreaView>
          </Modal>

          <Button onPress={handlePost}>Post Listing Now 🚀</Button>
        </View>
      );
    }

    // Step 3: Success
    return (
      <View style={styles.successState}>
        <View style={styles.successCircle}>
          <CheckCircle2 size={60} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Successfully Posted!</Text>
        <Text style={styles.successSub}>
          Your food listing is now visible to people nearby.
        </Text>
        <View style={styles.successCard}>
          <View style={styles.scRow}>
            <Text style={styles.scLabel}>Food:</Text>
            <Text style={styles.scVal}>{formData.title}</Text>
          </View>
          <View style={styles.scRow}>
            <Text style={styles.scLabel}>Expires:</Text>
            <Text style={[styles.scVal, { color: colors.amber }]}>
              {new Date(formData.expiryISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.scRow}>
            <Text style={styles.scLabel}>Status:</Text>
            <Text style={[styles.scVal, { color: colors.green }]}>● Live</Text>
          </View>
          {formData.tags.length > 0 && (
            <View style={styles.scRow}>
              <Text style={styles.scLabel}>Tags:</Text>
              <Text style={styles.scVal}>{formData.tags.join(', ')}</Text>
            </View>
          )}
        </View>
        <Button variant="ghost" onPress={onSuccess}>Done</Button>
        <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Post Food</Text>
        </View>

        <ScrollView style={styles.scrollArea}>
          {step < 3 && (
            <View style={styles.stepIndicator}>
              <View style={[styles.dot, step >= 1 && styles.dotActive]} />
              <View style={[styles.line, step >= 2 && styles.lineActive]} />
              <View style={[styles.dot, step >= 2 && styles.dotActive]} />
              <View style={[styles.line, step >= 3 && styles.lineActive]} />
              <View style={[styles.dot, step >= 3 && styles.dotActive]} />
            </View>
          )}
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: colors.surface2,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', marginLeft: 16, color: colors.ink },
    scrollArea: { flex: 1, padding: 20 },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
    },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.green },
    line: { width: 40, height: 2, backgroundColor: colors.border },
    lineActive: { backgroundColor: colors.green },
    formStep: { gap: 20 },
    photoUpload: { marginBottom: 10 },
    uploadBox: {
      height: 150,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    uploadText: { color: colors.inkMute, fontWeight: '600' },
    previewImage: { width: '100%', height: '100%', borderRadius: 20 },
    fieldGroup: { gap: 8 },
    label: { fontSize: 12, fontWeight: '700', color: colors.ink },
    input: {
      height: 56,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      paddingHorizontal: 16,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.ink,
    },
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: { backgroundColor: colors.green, borderColor: colors.green },
    pillTagActive: { backgroundColor: colors.blue, borderColor: colors.blue },
    pillText: { fontSize: 12, fontWeight: '600', color: colors.inkMute },
    pillTextActive: { color: '#fff' },
    pillTagTextActive: { color: '#fff' },
    locationBox: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.blueLight,
      borderWidth: 1,
      borderColor: 'rgba(37, 99, 235, 0.2)',
    },
    locationText: { color: colors.blue, fontWeight: '600' },
    mapHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mapFooter: {
      padding: 20,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    successState: { alignItems: 'center', paddingTop: 40 },
    successCircle: {
      width: 100,
      height: 100,
      backgroundColor: colors.green,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      elevation: 10,
    },
    successTitle: { fontSize: 24, fontWeight: '800', color: colors.ink, marginBottom: 8 },
    successSub: {
      fontSize: 14,
      color: colors.inkMute,
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    successCard: {
      width: '100%',
      padding: 20,
      backgroundColor: colors.surface2,
      borderRadius: 20,
      gap: 12,
      marginBottom: 30,
    },
    scRow: { flexDirection: 'row', justifyContent: 'space-between' },
    scLabel: { fontSize: 12, color: colors.inkMute, fontWeight: '600' },
    scVal: { fontSize: 14, fontWeight: '700', color: colors.ink },
  });
