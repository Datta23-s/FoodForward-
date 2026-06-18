import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, User as UserIcon, Package, Clock } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import Profile from './Profile';
import Notifications from './Notifications';
import FoodDetail from './FoodDetail';
import { GlassView } from '../components/GlassView';
import { useCountdown } from '../utils/timeUtils';

// Reuse listing card with countdown
function NGOListingCard({ item, selected, onPress, onSelect, colors }) {
  const countdown = useCountdown(item.expiryISO);
  return (
    <Pressable
      style={[ngoCardStyle(colors).card, selected && ngoCardStyle(colors).cardSelected]}
      onPress={onPress}
    >
      <Pressable
        style={[ngoCardStyle(colors).checkbox, selected && ngoCardStyle(colors).checkboxChecked]}
        onPress={onSelect}
      >
        {selected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>}
      </Pressable>
      <View style={ngoCardStyle(colors).emoji}>
        <Text style={{ fontSize: 24 }}>{item.emoji || '🍱'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ngoCardStyle(colors).title} numberOfLines={1}>{item.title}</Text>
        <Text style={ngoCardStyle(colors).meta}>{item.donor} · {item.distance}</Text>
        {item.expiryISO && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Clock size={10} color={countdown.isUrgent ? '#ef4444' : colors.inkMute} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: countdown.isUrgent ? '#ef4444' : colors.inkMute }}>
              {countdown.isExpired ? 'Expired' : countdown.label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const ngoCardStyle = (colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  cardSelected: { borderColor: colors.blue, backgroundColor: colors.blueLight },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.blue, borderColor: colors.blue },
  emoji: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 11, color: colors.inkMute, marginTop: 2 },
});

export default function NGODashboard() {
  const { listings, user, claimListing } = useAppContext();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [batchConfirm, setBatchConfirm] = useState(false);

  const liveFeed = listings.filter(
    (l) => l.status === 'Live' && (l.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const claimedFeed = listings.filter((l) => ['Claimed_Direct', 'Waiting_For_Driver'].includes(l.status));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const batchClaim = () => {
    if (selectedIds.size === 0) {
      Alert.alert('Select items', 'Check the boxes next to listings to batch-claim them.');
      return;
    }
    setBatchConfirm(true);
  };

  const confirmBatch = () => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => claimListing(id, false, user));
    setBatchConfirm(false);
    setSelectedIds(new Set());
    Alert.alert('Batch Claimed ✅', `${count} listings have been reserved for your organization.`);
  };

  if (selectedItem) {
    return (
      <FoodDetail
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        user={user}
        onTrack={() => {}}
        onClaim={(id) => {
          claimListing(id, false, user);
          setSelectedItem(null);
        }}
        onChat={() => {}}
      />
    );
  }

  if (activeTab === 'profile') return <Profile onBack={() => setActiveTab('home')} />;
  if (activeTab === 'notifications') return <Notifications onBack={() => setActiveTab('home')} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <GlassView style={styles.header} intensity={10}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              NGO Hub 🏢 <Text style={{ color: colors.blue }}>{user?.name}</Text>
            </Text>
            <Text style={styles.sub}>{liveFeed.length} items available to claim</Text>
          </View>
          <Pressable style={styles.notifBtn} onPress={() => setActiveTab('notifications')}>
            <Bell size={20} color="#fff" />
          </Pressable>
        </View>
      </GlassView>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{selectedIds.size}</Text>
          <Text style={styles.statLbl}>Selected</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{claimedFeed.length}</Text>
          <Text style={styles.statLbl}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{user?.impact || 0}</Text>
          <Text style={styles.statLbl}>Impact pts</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.inkMute} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food..."
            placeholderTextColor={colors.inkMute}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {selectedIds.size > 0 && (
          <Pressable style={styles.batchBtn} onPress={batchClaim}>
            <Package size={18} color="#fff" />
            <Text style={styles.batchText}>Claim {selectedIds.size}</Text>
          </Pressable>
        )}
      </View>

      {/* Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Available Food</Text>
        {liveFeed.map((item) => (
          <NGOListingCard
            key={item.id}
            item={item}
            colors={colors}
            selected={selectedIds.has(item.id)}
            onPress={() => setSelectedItem(item)}
            onSelect={() => toggleSelect(item.id)}
          />
        ))}
        {liveFeed.length === 0 && (
          <Text style={styles.emptyText}>No items available right now.</Text>
        )}
      </ScrollView>

      {/* Batch confirm modal */}
      <Modal visible={batchConfirm} transparent animationType="slide" onRequestClose={() => setBatchConfirm(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setBatchConfirm(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Confirm Batch Claim</Text>
            <Text style={styles.modalSub}>
              You are claiming <Text style={{ fontWeight: '800', color: colors.blue }}>{selectedIds.size} listings</Text> for your organization.
              This will reserve them immediately.
            </Text>
            <Button onPress={confirmBatch} style={{ width: '100%' }}>Confirm Batch Claim</Button>
            <Button variant="ghost" onPress={() => setBatchConfirm(false)} style={{ width: '100%', marginTop: 10 }}>Cancel</Button>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: Package, label: 'Feed' },
          { id: 'notifications', icon: Bell, label: 'Alerts' },
          { id: 'profile', icon: UserIcon, label: 'Profile' },
        ].map((tab) => (
          <Pressable key={tab.id} style={styles.navItem} onPress={() => setActiveTab(tab.id)}>
            <View style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}>
              <tab.icon size={24} color={activeTab === tab.id ? colors.blue : colors.inkMute} />
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      backgroundColor: '#0f1a38',
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
    sub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    notifBtn: {
      width: 44, height: 44,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statVal: { fontSize: 22, fontWeight: '900', color: colors.ink },
    statLbl: { fontSize: 10, fontWeight: '700', color: colors.inkMute, textTransform: 'uppercase', marginTop: 2 },
    searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBg,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.ink },
    batchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.blue,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    batchText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    feed: { flex: 1, paddingHorizontal: 16 },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.inkMute,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    emptyText: { textAlign: 'center', color: colors.inkMute, paddingVertical: 40 },
    bottomNav: {
      height: 80,
      backgroundColor: colors.navBg,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
    },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon: { padding: 10 },
    navIconActive: { backgroundColor: colors.blueLight, borderRadius: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
      paddingBottom: 40,
      alignItems: 'center',
    },
    sheetHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 8 },
    modalSub: { fontSize: 14, color: colors.inkMute, textAlign: 'center', marginBottom: 24, lineHeight: 21 },
  });
