import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { 
  ChevronLeft, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Award,
  ChevronRight
} from 'lucide-react-native';
import { db } from '../utils/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { GlassView } from '../components/GlassView';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

export default function Leaderboard({ onBack }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const [topUsers, setTopUsers] = useState([
    { id: '1', name: 'Ayesha K.', impact: 84, streak: 12, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', rank: 1 },
    { id: '2', name: 'Rahul M.', impact: 72, streak: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rank: 2 },
    { id: '3', name: 'Sam Vitri', impact: 65, streak: 8, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', rank: 3 },
    { id: '4', name: 'Priya S.', impact: 48, streak: 3, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', rank: 4 },
  ]);

  // Fetch from Firestore if available
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('impact', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }));
      if (users.length > 0) setTopUsers(users);
    });
    return unsubscribe;
  }, []);

  const renderTopThree = () => {
    const topThree = topUsers.slice(0, 3);
    return (
      <View style={styles.podiumContainer}>
        {/* Rank 2 */}
        <View style={[styles.podiumItem, { paddingTop: 40 }]}>
          <View style={styles.podiumAvatarWrapper}>
            <Image source={{ uri: topThree[1]?.avatar }} style={[styles.podiumAvatar, { borderColor: '#94a3b8' }]} />
            <View style={[styles.rankBadge, { backgroundColor: '#94a3b8' }]}>
              <Text style={styles.rankText}>2</Text>
            </View>
          </View>
          <Text style={styles.podiumName}>{topThree[1]?.name}</Text>
          <Text style={styles.podiumImpact}>{topThree[1]?.impact} pts</Text>
        </View>

        {/* Rank 1 */}
        <View style={styles.podiumItem}>
          <Trophy size={28} color={theme.colors.amber} style={{ marginBottom: 8 }} />
          <View style={styles.podiumAvatarWrapper}>
            <Image source={{ uri: topThree[0]?.avatar }} style={[styles.podiumAvatar, { width: 80, height: 80, borderRadius: 40, borderColor: theme.colors.amber }]} />
            <View style={[styles.rankBadge, { backgroundColor: theme.colors.amber, width: 30, height: 30, borderRadius: 15 }]}>
              <Text style={styles.rankText}>1</Text>
            </View>
          </View>
          <Text style={[styles.podiumName, { fontSize: 18 }]}>{topThree[0]?.name}</Text>
          <Text style={[styles.podiumImpact, { color: theme.colors.amber }]}>{topThree[0]?.impact} pts</Text>
        </View>

        {/* Rank 3 */}
        <View style={[styles.podiumItem, { paddingTop: 40 }]}>
          <View style={styles.podiumAvatarWrapper}>
            <Image source={{ uri: topThree[2]?.avatar }} style={[styles.podiumAvatar, { borderColor: '#cd7f32' }]} />
            <View style={[styles.rankBadge, { backgroundColor: '#cd7f32' }]}>
              <Text style={styles.rankText}>3</Text>
            </View>
          </View>
          <Text style={styles.podiumName}>{topThree[2]?.name}</Text>
          <Text style={styles.podiumImpact}>{topThree[2]?.impact} pts</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={theme.colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Community Top</Text>
          <View style={{width: 44}} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GlassView style={styles.heroGlass} intensity={15}>
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroTitle}>World Food Hero</Text>
                <Text style={styles.heroSub}>Top savers this week</Text>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={16} color="#fff" />
                <Text style={styles.streakText}>All Time</Text>
              </View>
            </View>
            {renderTopThree()}
          </View>
        </GlassView>

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <TrendingUp size={18} color={theme.colors.green} />
            <Text style={styles.listLabel}>Rising Savers</Text>
          </View>

          {topUsers.slice(3).map((u, i) => (
            <Pressable key={u.id} style={styles.userRow}>
              <Text style={styles.rowRank}>{u.rank}</Text>
              <Image 
                source={{ uri: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }} 
                style={styles.rowAvatar} 
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{u.name || 'Anonymous User'}</Text>
                <View style={styles.rowBadges}>
                  {(u.impact || 0) > 50 && <Award size={12} color={theme.colors.amber} />}
                  <Text style={styles.rowMeta}>{u.streak || 0} day streak</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowImpact}>{u.impact || 0}</Text>
                <ChevronRight size={16} color={theme.colors.inkMute} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* My Position Card */}
        {(() => {
          const myRank = topUsers.findIndex(u => u.id === user?.uid);
          const rank = myRank >= 0 ? myRank + 1 : '—';
          const myImpact = topUsers.find(u => u.id === user?.uid)?.impact || user?.impact || 0;
          return (
            <View style={[styles.myRankCard, { backgroundColor: colors.greenLight, borderColor: colors.greenGlow }]}>
              <View style={styles.myRankLeft}>
                <View style={[styles.myRankCircle, { backgroundColor: colors.green }]}>
                  <Text style={styles.myRankNum}>{rank}</Text>
                </View>
                <View>
                  <Text style={[styles.myRankTitle, { color: colors.greenDark }]}>Your Position</Text>
                  <Text style={[styles.myRankSub, { color: colors.green }]}>{myImpact} impact points</Text>
                </View>
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  searchBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  heroGlass: {
    marginBottom: 30,
    backgroundColor: theme.colors.ink,
    borderRadius: 32,
  },
  heroContent: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  podiumName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  podiumImpact: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    marginBottom: 30,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowRank: {
    width: 30,
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.inkMute,
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 16,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 11,
    color: theme.colors.inkMute,
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowImpact: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  myRankCard: {
    backgroundColor: theme.colors.greenLight,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.1)',
    marginBottom: 40,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  myRankCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankNum: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  myRankTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.greenDark,
  },
  myRankSub: {
    fontSize: 12,
    color: theme.colors.green,
    fontWeight: '600',
    marginTop: 1,
  },
  myRankBtn: {
    paddingHorizontal: 16,
  }
});
