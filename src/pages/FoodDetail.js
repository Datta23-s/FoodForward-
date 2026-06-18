import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Clock, Info, User, Star, MessageCircle, Phone } from 'lucide-react-native';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';

export default function FoodDetail({ item, onBack, onClaim, onChat, onTrack }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const initClaim = () => {
    // Direct self-pickup claims only (no delivery)
    onClaim(item.id, false);
    Alert.alert(
      "Food Reserved! 🎉",
      "Navigate to the Donor now. When you arrive, go to your History tab and tap \"Verify Pickup\" to enter the OTP code shown on the Donor's screen.",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Navigate Now",
          onPress: () => {
            const latitude = item?.lat || 18.5204;
            const longitude = item?.lng || 73.8567;
            const url = Platform.OS === 'ios'
              ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
              : `google.navigation:q=${latitude},${longitude}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.hero, {backgroundColor: item.warm ? '#fff4e6' : colors.greenLight}]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ChevronLeft color={colors.ink} size={24} />
        </Pressable>
        <Text style={styles.heroEmoji}>{item.emoji}</Text>
        <View style={styles.heroTags}>
          <View style={styles.tag}><Text style={styles.tagText}>FRESH</Text></View>
          <View style={[styles.tag, {backgroundColor: 'rgba(45, 158, 95, 0.1)'}]}><Text style={[styles.tagText, {color: colors.green}]}>VEG</Text></View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{item.title}</Text>
        
        <View style={styles.metaRow}>
          <Pressable style={styles.metaChip} onPress={() => {
            Alert.alert(
              "Directions",
              "Open OS GPS software to navigate to donor?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Start Route", 
                  onPress: () => {
                    const latitude = item?.lat || 18.5204;
                    const longitude = item?.lng || 73.8567;
                    const url = Platform.OS === 'ios'
                      ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
                      : `google.navigation:q=${latitude},${longitude}`;
                    Linking.openURL(url).catch(() => {
                      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
                    });
                  }
                }
              ]
            );
          }}>
            <MapPin size={14} color={colors.blue} />
            <Text style={[styles.metaText, {color: colors.blue}]}>Navigate via Maps</Text>
          </Pressable>
          <View style={styles.metaChip}><Clock size={14} color={colors.inkMute} /><Text style={styles.metaText}>{item.time}</Text></View>
          <View style={styles.metaChip}><Info size={14} color={colors.inkMute} /><Text style={styles.metaText}>{item.quantity}</Text></View>
        </View>

        <View style={styles.donorCard}>
          <View style={styles.donorAvatar}><User size={20} color="#fff" /></View>
          <View style={styles.donorInfo}>
            <Text style={styles.donorName}>{item.donor}</Text>
            <Text style={styles.donorSub}>Super Donor · 4.9 <Star size={10} color={colors.amber} fill={colors.amber} /></Text>
          </View>
          <Pressable style={styles.chatBtn} onPress={() => {
            const phone = item?.donorPhone;
            if (!phone) {
              Alert.alert('No Phone Number', 'This donor has not shared their phone number. Try sending a chat message instead.');
              return;
            }
            Alert.alert('Call Donor', `Call ${item.donor}?`, [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`)}
            ]);
          }}>
            <Phone size={20} color={colors.blue} />
          </Pressable>
          <Pressable style={styles.chatBtn} onPress={() => onChat(item)}>
            <MessageCircle size={20} color={colors.green} />
          </Pressable>
        </View>

        <View style={styles.descBlock}>
          <Text style={styles.blockTitle}>Description</Text>
          <Text style={styles.blockText}>This food was prepared fresh today for an event. It has been kept in professional temperature-controlled storage and is ready for immediate pickup.</Text>
        </View>

        <View style={styles.descBlock}>
          <Text style={styles.blockTitle}>Pickup Instructions</Text>
          <Text style={styles.blockText}>Please arrive at the pickup location. Mention "FoodForward" when you arrive for priority pickup.</Text>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={initClaim}>Claim This Food 🤝</Button>
      </View>


    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroEmoji: {
    fontSize: 90,
  },
  heroTags: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.ink,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface2,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  donorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  donorAvatar: {
    width: 48,
    height: 48,
    backgroundColor: colors.blue,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  donorSub: {
    fontSize: 11,
    color: colors.inkMute,
    marginTop: 2,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  descBlock: {
    marginBottom: 24,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  blockText: {
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.glassBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
