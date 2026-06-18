import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Dimensions, TextInput, Modal, Alert, Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, Map as MapIcon, List, Search, Clock, MapPin,
  Trophy, MessageSquare, Phone, User as UserIcon,
} from 'lucide-react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import FoodDetail from './FoodDetail';
import Profile from './Profile';
import Leaderboard from './Leaderboard';
import Notifications from './Notifications';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import RatingModal from './RatingModal';
import { GlassView } from '../components/GlassView';
import { Button } from '../components/Button';
import { useCountdown } from '../utils/timeUtils';

const { width, height } = Dimensions.get('window');

// ─── Listing card with countdown ─────────────────────────────────────────────
function ListingCard({ item, onPress, colors }) {
  const countdown = useCountdown(item.expiryISO);

  return (
    <Pressable style={[cardStyle(colors).card]} onPress={onPress}>
      {/* Thumbnail */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={cardStyle(colors).thumb} />
      ) : (
        <View style={cardStyle(colors).thumbEmoji}>
          <Text style={{ fontSize: 26 }}>{item.emoji || '🍱'}</Text>
        </View>
      )}
      <View style={cardStyle(colors).info}>
        <Text style={cardStyle(colors).title} numberOfLines={1}>{item.title}</Text>
        <Text style={cardStyle(colors).meta}>{item.donor} · {item.distance}</Text>
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[cardStyle(colors).tagPill, { backgroundColor: colors.blueLight }]}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: colors.blue }}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Countdown */}
        {item.expiryISO && (
          <View style={[cardStyle(colors).countdown, countdown.isUrgent && cardStyle(colors).countdownUrgent]}>
            <Clock size={10} color={countdown.isUrgent ? '#ef4444' : colors.inkMute} />
            <Text style={[cardStyle(colors).countdownText, countdown.isUrgent && { color: '#ef4444' }]}>
              {countdown.isExpired ? 'Expired' : countdown.label}
            </Text>
          </View>
        )}
      </View>
      <View style={cardStyle(colors).distBadge}>
        <Text style={cardStyle(colors).distText}>{item.distance}</Text>
      </View>
    </Pressable>
  );
}

const cardStyle = (colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  thumbEmoji: {
    width: 56,
    height: 56,
    backgroundColor: colors.blueLight,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 11, color: colors.inkMute, marginTop: 2 },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: colors.surface2,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countdownUrgent: { backgroundColor: '#fee2e2' },
  countdownText: { fontSize: 10, fontWeight: '700', color: colors.inkMute },
  distBadge: {
    backgroundColor: colors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distText: { fontSize: 10, fontWeight: '800', color: colors.blue },
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ReceiverDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietTag, setSelectedDietTag] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const { listings, user, claimListing } = useAppContext();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // OTP verification state
  const [verifyItem, setVerifyItem] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [React.useRef(), React.useRef(), React.useRef(), React.useRef()];

  // Rating modal state
  const [ratingItem, setRatingItem] = useState(null);

  const handleOtp = (index, val) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 3) otpRefs[index + 1].current.focus();
  };

  const contactPerson = (role, name, phone) => {
    const dialNumber = phone || '+919999999999';
    Alert.alert(
      `Contact ${role}`,
      `How would you like to reach ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '📞 Call',
          onPress: () => Linking.openURL(`tel:${dialNumber}`).catch(() => Alert.alert('Error', 'Phone dialer not available.')),
        },
        {
          text: '💬 SMS',
          onPress: () => Linking.openURL(`sms:${dialNumber}?body=Hi ${name}, I am on my way for the FoodForward pickup!`).catch(() => Alert.alert('Error', 'SMS not available.')),
        },
      ]
    );
  };

  const finalizeVerify = () => {
    const enteredOtp = otp.join('');
    const correctOtp = verifyItem?.otp;
    if (enteredOtp !== correctOtp) {
      Alert.alert('Wrong OTP ❌', 'The code does not match. Ask the Donor for the correct 4-digit code.');
      return;
    }
    const collectedItem = verifyItem;
    setVerifyItem(null);
    setOtp(['', '', '', '']);
    Alert.alert('Pickup Verified! ✅', 'Thank you for collecting the food. You made a difference today!');
    // Trigger rating modal after short delay
    setTimeout(() => setRatingItem(collectedItem), 800);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const fallback = { latitude: 18.5204, longitude: 73.8567 };
      if (status !== 'granted') { setUserLocation(fallback); return; }
      try {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      } catch (e) { setUserLocation(fallback); }
    })();
  }, []);

  const filteredListings = listings.filter((l) => {
    const title = (l.title || '').toLowerCase();
    const donor = (l.donor || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const isLive = l.status === 'Live';
    const matchesSearch = title.includes(query) || donor.includes(query);
    const matchesCategory = selectedCategory === 'All' || l.type === selectedCategory;
    const matchesDiet = selectedDietTag === 'All' || (l.tags || []).includes(selectedDietTag);
    return isLive && matchesSearch && matchesCategory && matchesDiet;
  });

  const renderContent = () => {
    if (activeTab === 'search') {
      return (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.inkMute} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search food, cafe, donor..."
                placeholderTextColor={colors.inkMute}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          <FilterRow
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDietTag={selectedDietTag}
            setSelectedDietTag={setSelectedDietTag}
            colors={colors}
            styles={styles}
          />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Search Results</Text>
            <View style={styles.listingsList}>
              {filteredListings.length > 0
                ? filteredListings.map((item) => (
                    <ListingCard key={item.id} item={item} colors={colors} onPress={() => setSelectedItem(item)} />
                  ))
                : <Text style={styles.emptyResults}>No items match your search.</Text>}
            </View>
          </View>
        </ScrollView>
      );
    }

    if (viewMode === 'map') {
      const displayLocation = userLocation || { latitude: 18.5204, longitude: 73.8567 };
      return (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{ ...displayLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          >
            <Marker coordinate={displayLocation} title="You">
              <View style={[styles.markerContainer, { backgroundColor: colors.blue }]}>
                <View style={styles.userDot} />
              </View>
            </Marker>
            {filteredListings.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.lat || 18.5204, longitude: item.lng || 73.8567 }}
                title={item.title || 'Food Item'}
                onPress={() => setSelectedItem(item)}
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerEmoji}>{item.emoji || '🍽'}</Text>
                </View>
              </Marker>
            ))}
            {selectedItem && (
              <Polyline
                coordinates={[
                  displayLocation,
                  { latitude: selectedItem.lat || 18.5204, longitude: selectedItem.lng || 73.8567 },
                ]}
                strokeColor={colors.blue}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
          {selectedItem ? (
            <GlassView style={styles.trackingPanel} intensity={25}>
              <View style={styles.tpHeader}>
                <Text style={styles.tpTitle}>Tracking {selectedItem.donor}</Text>
                <Pressable onPress={() => setSelectedItem(null)}>
                  <Text style={styles.tpClose}>Dismiss</Text>
                </Pressable>
              </View>
              <View style={styles.tpInfo}>
                <View style={styles.tpStat}><Clock size={16} color={colors.blue} /><Text style={styles.tpStatText}>8 mins away</Text></View>
                <View style={styles.tpStat}><MapPin size={16} color={colors.blue} /><Text style={styles.tpStatText}>{selectedItem.distance}</Text></View>
              </View>
              <Button size="small" onPress={() => setViewMode('list')} style={styles.tpBtn}>View Details</Button>
            </GlassView>
          ) : (
            <Pressable style={styles.floatingToggle} onPress={() => setViewMode('list')}>
              <List size={20} color="#fff" />
              <Text style={styles.toggleText}>List View</Text>
            </Pressable>
          )}
        </View>
      );
    }

    if (activeTab === 'notifications') {
      return <Notifications onBack={() => setActiveTab('home')} />;
    }
    if (activeTab === 'profile') {
      return <Profile onBack={() => setActiveTab('home')} />;
    }
    if (activeTab === 'history') {
      const historyItems = listings.filter((l) =>
        ['Claimed', 'Claimed_Direct', 'Waiting_For_Driver', 'In_Transit', 'Delivered'].includes(l.status)
      );
      return (
        <ScrollView style={styles.scrollArea}>
          <Text style={styles.sectionLabel}>Claim History</Text>
          {historyItems.length > 0
            ? historyItems.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.historyThumb}>
                      {item.image
                        ? <Image source={{ uri: item.image }} style={{ width: 48, height: 48, borderRadius: 12 }} />
                        : <Text style={{ fontSize: 24 }}>{item.emoji}</Text>}
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle}>{item.title}</Text>
                      <Text style={styles.historyMeta}>{item.donor} · {item.time}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? colors.greenLight : colors.blueLight }]}>
                        <Text style={[styles.statusText, { color: item.status === 'Delivered' ? colors.greenDark : colors.blue }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.historyContactRow}>
                      <Pressable style={[styles.miniContactBtn, { backgroundColor: colors.blueLight }]} onPress={() => contactPerson('Donor', item.donor, item.donorPhone)}>
                        <Phone size={14} color={colors.blue} />
                      </Pressable>
                    </View>
                  </View>
                  {item.status === 'Claimed_Direct' && (
                    <Button size="small" variant="outline" style={{ marginTop: 12 }} onPress={() => setVerifyItem(item)}>
                      Verify Arrival &amp; Collect
                    </Button>
                  )}
                </View>
              ))
            : <Text style={styles.emptyResults}>No claim history yet.</Text>}
          <Button variant="ghost" onPress={() => setActiveTab('home')} style={{ marginTop: 20 }}>Back to Home</Button>
        </ScrollView>
      );
    }
    if (activeTab === 'leaderboard') {
      return <Leaderboard onBack={() => setActiveTab('home')} />;
    }
    if (activeTab === 'chat') {
      return <ChatList onBack={() => setActiveTab('home')} onSelectChat={(chat) => setSelectedItem(chat)} />;
    }

    // Default: Home feed
    return (
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.inkMute} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food, cafe, donor..."
              placeholderTextColor={colors.inkMute}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FilterRow
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDietTag={selectedDietTag}
          setSelectedDietTag={setSelectedDietTag}
          colors={colors}
          styles={styles}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable style={[styles.qaCard, styles.qaBlue]} onPress={() => setViewMode('map')}>
              <MapIcon size={24} color={colors.blue} />
              <Text style={styles.qaLabel}>Map View</Text>
            </Pressable>
            <Pressable style={styles.qaCard} onPress={() => setActiveTab('history')}>
              <Clock size={24} color={colors.ink} />
              <Text style={styles.qaLabel}>History</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nearby Food</Text>
          <View style={styles.listingsList}>
            {filteredListings.length > 0
              ? filteredListings.map((item) => (
                  <ListingCard key={item.id} item={item} colors={colors} onPress={() => setSelectedItem(item)} />
                ))
              : <Text style={styles.emptyResults}>No items match your search.</Text>}
          </View>
        </View>
      </ScrollView>
    );
  };

  if (activeTab === 'chat' && selectedItem) {
    return <ChatRoom chat={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  if (selectedItem && activeTab === 'home' && viewMode !== 'map') {
    return (
      <FoodDetail
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        user={user}
        onTrack={() => setViewMode('map')}
        onClaim={(id) => {
          claimListing(id, false, user);
          setSelectedItem(null);
        }}
        onChat={(item) => {
          setActiveTab('chat');
          setSelectedItem({
            id: 'temp_' + Date.now(),
            otherUserName: item.donor,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          });
        }}
      />
    );
  }

  if (selectedItem && viewMode !== 'map') {
    return (
      <FoodDetail
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        user={user}
        onTrack={() => { setViewMode('map'); setActiveTab('home'); }}
        onClaim={(id) => {
          claimListing(id, false, user);
          setSelectedItem(null);
        }}
        onChat={(item) => {
          setActiveTab('chat');
          setSelectedItem({
            id: 'temp_' + Date.now(),
            otherUserName: item.donor,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'home' && (
        <GlassView style={[styles.header, styles.receiverHeader]} intensity={10}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                Hello, <Text style={{ color: colors.blue }}>{user?.name || 'Priya'}</Text> 🤝
              </Text>
              <Text style={styles.impactStats}>{listings.filter(l => l.status === 'Live').length} items available nearby</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={styles.notifBtn} onPress={() => setActiveTab('chat')}>
                <MessageSquare size={20} color={colors.white} />
              </Pressable>
              <Pressable style={styles.notifBtn} onPress={() => setActiveTab('leaderboard')}>
                <Trophy size={20} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </GlassView>
      )}

      <View style={{ flex: 1 }}>{renderContent()}</View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: MapIcon, label: 'Map' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'notifications', icon: Bell, label: 'Notifs' },
          { id: 'profile', icon: UserIcon, label: 'Profile' },
        ].map((tab) => (
          <Pressable key={tab.id} style={styles.navItem} onPress={() => setActiveTab(tab.id)}>
            <View style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}>
              <tab.icon size={24} color={activeTab === tab.id ? colors.blue : colors.inkMute} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* OTP Verification Modal */}
      <Modal visible={!!verifyItem} transparent animationType="slide" onRequestClose={() => setVerifyItem(null)}>
        <View style={styles.otpOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setVerifyItem(null)} />
          <View style={styles.otpSheet}>
            <View style={styles.otpHandle} />
            <Text style={styles.otpTitle}>Verify Pickup</Text>
            <Text style={styles.otpSubtitle}>
              Enter the 4-digit code shown on the Donor's screen for "{verifyItem?.title}".
            </Text>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={otpRefs[i]}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtp(i, val)}
                />
              ))}
            </View>
            <Button onPress={finalizeVerify}>Verify &amp; Collect</Button>
            <Pressable style={{ marginTop: 16, padding: 12 }} onPress={() => setVerifyItem(null)}>
              <Text style={{ color: colors.inkMute, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        visible={!!ratingItem}
        onClose={() => setRatingItem(null)}
        listing={ratingItem}
        reviewerId={user?.uid}
      />
    </SafeAreaView>
  );
}

// ─── Filter Row component ─────────────────────────────────────────────────────
function FilterRow({ selectedCategory, setSelectedCategory, selectedDietTag, setSelectedDietTag, colors, styles }) {
  const CATEGORIES = ['All', 'Meals', 'Bakery', 'Fruits', 'Drinks'];
  const DIET_TAGS = ['All', 'Vegan', 'Non-Veg', 'Cooked', 'Packaged'];

  return (
    <View style={{ marginBottom: 20 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </Pressable>
        ))}
        <View style={{ width: 1, height: 36, backgroundColor: colors.border, marginHorizontal: 4, alignSelf: 'center' }} />
        {DIET_TAGS.map((tag) => (
          <Pressable
            key={`diet_${tag}`}
            onPress={() => setSelectedDietTag(tag)}
            style={[styles.filterChip, selectedDietTag === tag && { ...styles.filterChipActive, backgroundColor: colors.blue, borderColor: colors.blue }]}
          >
            <Text style={[styles.filterText, selectedDietTag === tag && styles.filterTextActive]}>{tag}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    receiverHeader: { backgroundColor: colors.headerBg },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
    impactStats: { fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4 },
    notifBtn: {
      width: 44,
      height: 44,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollArea: { flex: 1, padding: 20 },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 30 },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.ink,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    quickActions: { flexDirection: 'row', gap: 12 },
    qaCard: {
      flex: 1,
      backgroundColor: colors.cardBg,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    qaBlue: { backgroundColor: colors.blueLight, borderColor: colors.blue },
    qaLabel: { fontSize: 12, fontWeight: '700', color: colors.ink, marginTop: 8 },
    listingsList: { gap: 12 },
    mapContainer: { flex: 1 },
    map: { width: '100%', height: '100%' },
    markerContainer: {
      backgroundColor: colors.cardBg,
      padding: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.blue,
      elevation: 4,
    },
    markerEmoji: { fontSize: 20 },
    userDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
    floatingToggle: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blue,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
      elevation: 8,
      gap: 8,
    },
    toggleText: { color: '#fff', fontWeight: '700' },
    bottomNav: {
      height: 80,
      backgroundColor: colors.navBg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 10,
    },
    navItem: { alignItems: 'center', justifyContent: 'center' },
    navIcon: { padding: 10 },
    navIconActive: { backgroundColor: colors.blueLight, borderRadius: 12 },
    searchBarContainer: { marginBottom: 12 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: colors.ink },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 50,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.green, borderColor: colors.green },
    filterText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    filterTextActive: { color: '#fff' },
    emptyResults: { textAlign: 'center', color: colors.inkMute, paddingVertical: 20, fontSize: 14 },
    trackingPanel: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.glassBg,
      borderRadius: 24,
      padding: 20,
    },
    tpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tpTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
    tpClose: { fontSize: 12, fontWeight: '700', color: colors.inkMute },
    tpInfo: { flexDirection: 'row', gap: 20, marginBottom: 16 },
    tpStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tpStatText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    tpBtn: { width: '100%' },
    historyCard: {
      backgroundColor: colors.cardBg,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
    historyThumb: {
      width: 52,
      height: 52,
      backgroundColor: colors.surface2,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
    historyMeta: { fontSize: 11, color: colors.inkMute, marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
    statusText: { fontSize: 10, fontWeight: '800' },
    historyContactRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    miniContactBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.amberLight,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    otpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    otpSheet: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
      alignItems: 'center',
    },
    otpHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, marginBottom: 24 },
    otpTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 8 },
    otpSubtitle: { fontSize: 14, color: colors.inkMute, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    otpRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    otpBox: {
      width: 56,
      height: 70,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '800',
      borderWidth: 2,
      borderColor: colors.border,
      color: colors.ink,
    },
  });
