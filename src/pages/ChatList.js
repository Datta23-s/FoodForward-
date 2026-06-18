import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image 
} from 'react-native';
import { db } from '../utils/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { GlassView } from '../components/GlassView';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Search, MessageSquare } from 'lucide-react-native';

export default function ChatList({ onBack, onSelectChat }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [chats, setChats] = useState([
    { id: '1', otherUserName: 'Rahul M.', lastMessage: 'Is the Biryani still available?', time: '2m ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', unread: true },
    { id: '2', otherUserName: 'Ayesha K.', lastMessage: 'Thank you so much! Picked it up.', time: '1h ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', unread: false },
  ]);
  const { user } = useAppContext();

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'), 
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
      
      // Only overwrite seed data if Firestore actually has chats
      if (chatData.length > 0) {
        setChats(chatData);
      }
    });

    return unsubscribe;
  }, [user]);

  const renderChatItem = ({ item }) => (
    <Pressable style={styles.chatItem} onPress={() => onSelectChat(item)}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.otherUserName}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={[styles.lastMessage, item.unread && styles.unreadText]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <GlassView style={styles.header} intensity={15}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ChevronLeft size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable style={styles.moreBtn}>
          <Search size={22} color={colors.ink} />
        </Pressable>
      </GlassView>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageSquare size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>Connect with donors and receivers to coordinate pickups.</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
    backgroundColor: colors.surface,
    borderRadius: 0,
    borderWidth: 0,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  moreBtn: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  chatTime: {
    fontSize: 12,
    color: colors.inkMute,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.inkMute,
    flex: 1,
    marginRight: 10,
  },
  unreadText: {
    color: colors.ink,
    fontWeight: '700',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: colors.inkMute,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});
