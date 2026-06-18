import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, BarChart2, Plus, Trophy, MessageSquare, Home, Phone, User as UserIcon,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import PostFood from './PostFood';
import Profile from './Profile';
import Leaderboard from './Leaderboard';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import Notifications from './Notifications';
import { GlassView } from '../components/GlassView';

const { width } = Dimensions.get('window');

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedOtpItem, setSelectedOtpItem] = useState(null);
  const { listings, user } = useAppContext();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const myActiveListings = listings.filter((l) => l.status === 'Live' && l.donorId === user?.uid);
  const claimedListings = listings.filter(
    (l) =>
      l.donorId === user?.uid &&
      ['Claimed_Direct', 'Waiting_For_Driver', 'In_Transit'].includes(l.status)
  );

  // Show ALL live listings if donor has none posted yet (fallback for demo)
  const displayListings = myActiveListings.length > 0 ? myActiveListings : listings.filter(l => l.status === 'Live').slice(0, 3);

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
          onPress: () => Linking.openURL(`sms:${dialNumber}?body=Hi ${name}, I am your food donor from FoodForward.`).catch(() => Alert.alert('Error', 'SMS not available.')),
        },
      ]
    );
  };

  const renderContent = () => {
    if (activeTab === 'post') return <PostFood onBack={() => setActiveTab('home')} onSuccess={() => setActiveTab('home')} />;

    if (activeTab === 'chat') {
      if (selectedChat) return <ChatRoom chat={selectedChat} onBack={() => setSelectedChat(null)} />;
      return <ChatList onBack={() => setActiveTab('home')} onSelectChat={(chat) => setSelectedChat(chat)} />;
    }

    if (activeTab === 'leaderboard') return <Leaderboard onBack={() => setActiveTab('home')} />;
    if (activeTab === 'profile') return <Profile onBack={() => setActiveTab('home')} />;
    if (activeTab === 'notifications') return <Notifications onBack={() => setActiveTab('home')} />;

    return (
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable style={[styles.qaCard, styles.qaHighlight]} onPress={() => setActiveTab('post')}>
              <Text style={styles.qaIcon}>📤</Text>
              <Text style={styles.qaLabel}>Post Food</Text>
            </Pressable>
            <Pressable style={styles.qaCard} onPress={() => setActiveTab('notifications')}>
              <Bell size={24} color={colors.ink} style={{ marginBottom: 4 }} />
              <Text style={styles.qaLabel}>Notifs</Text>
            </Pressable>
            <Pressable style={styles.qaCard} onPress={() => setActiveTab('leaderboard')}>
              <Trophy size={24} color={colors.ink} style={{ marginBottom: 4 }} />
              <Text style={styles.qaLabel}>Scores</Text>
            </Pressable>
          </View>
        </View>

        {/* My active listings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>My Active Listings</Text>
          <View style={styles.listingsList}>
            {displayListings.length > 0 ? (
              displayListings.map((item) => (
                <Pressable key={item.id} style={styles.listingItem} onPress={() => setSelectedOtpItem(item)}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.listingThumb} />
                  ) : (
                    <View style={[styles.listingThumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenLight }]}>
                      <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                    </View>
                  )}
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle}>{item.title}</Text>
                    <Text style={styles.listingMeta}>{item.time} · {item.distance}</Text>
                    {item.tags && item.tags.length > 0 && (
                      <Text style={{ fontSize: 10, color: colors.blue, marginTop: 2 }}>{item.tags.join(' · ')}</Text>
                    )}
                  </View>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusText}>LIVE</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyText}>No active listings yet.</Text>
                <Button size="small" onPress={() => setActiveTab('post')} style={{ marginTop: 12 }}>
                  Post Food Now
                </Button>
              </View>
            )}
          </View>
        </View>

        {/* Claimed & In-Transit */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Claimed &amp; In-Transit</Text>
          <View style={styles.listingsList}>
            {claimedListings.length > 0 ? (
              claimedListings.map((item) => (
                <View key={item.id} style={[styles.listingItem, styles.claimedCard]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.listingThumb} />
                  ) : (
                    <View style={[styles.listingThumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 }]}>
                      <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                    </View>
                  )}
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle}>{item.title}</Text>
                    <Text style={styles.listingMeta}>Claimed by: {item.receiverName || 'NGO Partner'}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <Pressable
                      style={styles.miniContactBtn}
                      onPress={() => contactPerson('Receiver', item.receiverName || 'NGO Partner', item.receiverPhone)}
                    >
                      <Phone size={16} color={colors.blue} />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyText}>No items currently in transit.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'home' && (
        <GlassView style={styles.header} intensity={15}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                Hello, <Text style={{ color: colors.green }}>{user?.name || 'Rajesh'}</Text> 🌿
              </Text>
              <Text style={styles.impactStats}>{(user?.impact || 0) * 5} meals saved · Donor</Text>
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

      {/* OTP Modal */}
      <Modal visible={!!selectedOtpItem} transparent animationType="slide" onRequestClose={() => setSelectedOtpItem(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setSelectedOtpItem(null)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Pickup Verification</Text>
            <Text style={styles.modalSub}>
              When the receiver arrives for{' '}
              <Text style={{ fontWeight: '700', color: colors.ink }}>{selectedOtpItem?.title}</Text>,
              they will enter this 4-digit code to verify collection.
            </Text>
            <View style={styles.otpBox}>
              <Text style={styles.otpText}>{selectedOtpItem?.otp || '1234'}</Text>
            </View>
            <Button onPress={() => setSelectedOtpItem(null)} style={{ width: '100%' }}>Done</Button>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      {!(activeTab === 'chat' && selectedChat) && (
        <View style={styles.bottomNav}>
          {[
            { id: 'home', icon: Home, label: 'Feed' },
            { id: 'post', icon: Plus, label: 'Post' },
            { id: 'notifications', icon: Bell, label: 'Notifs' },
            { id: 'profile', icon: UserIcon, label: 'Profile' },
          ].map((tab) => (
            <Pressable key={tab.id} style={styles.navItem} onPress={() => setActiveTab(tab.id)}>
              <View style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}>
                <tab.icon size={24} color={activeTab === tab.id ? colors.green : colors.inkMute} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 24,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
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
    claimedCard: { borderColor: colors.border, backgroundColor: colors.cardBg },
    contactActions: { flexDirection: 'row', gap: 8 },
    miniContactBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.blueLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { marginBottom: 24 },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.ink,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    quickActions: { flexDirection: 'row', gap: 12 },
    qaCard: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    qaHighlight: { backgroundColor: colors.greenLight, borderColor: colors.green },
    qaIcon: { fontSize: 24, marginBottom: 8 },
    qaLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
    listingsList: { gap: 12 },
    listingItem: {
      flexDirection: 'row',
      backgroundColor: colors.cardBg,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 12,
    },
    listingThumb: { width: 52, height: 52, borderRadius: 14 },
    listingInfo: { flex: 1 },
    listingTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
    listingMeta: { fontSize: 11, color: colors.inkMute, marginTop: 2 },
    statusChip: { backgroundColor: colors.greenLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 9, fontWeight: '800', color: colors.greenDark },
    emptyStateContainer: {
      padding: 40,
      alignItems: 'center',
      backgroundColor: colors.surface2,
      borderRadius: 20,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: { color: colors.inkMute, fontSize: 14, fontWeight: '600' },
    bottomNav: {
      flexDirection: 'row',
      height: 80,
      backgroundColor: colors.navBg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
    },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    navIconActive: { backgroundColor: colors.greenLight },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalDismiss: { flex: 1 },
    modalSheet: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
      alignItems: 'center',
      paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 8 },
    modalSub: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    otpBox: {
      backgroundColor: colors.surface2,
      paddingHorizontal: 40,
      paddingVertical: 20,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.green,
      marginBottom: 30,
      borderStyle: 'dashed',
    },
    otpText: { fontSize: 40, fontWeight: '900', color: colors.greenDark, letterSpacing: 8 },
  });
