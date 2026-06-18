import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Send, Phone, MapPin, MoreHorizontal } from 'lucide-react-native';
import { db, auth } from '../utils/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setDoc,
  doc 
} from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function ChatRoom({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { user } = useAppContext();
  const { colors } = useTheme();
  const flatListRef = useRef();

  useEffect(() => {
    if (!chat?.id) return;

    const messagesRef = collection(db, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [chat.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.uid) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const messagesRef = collection(db, 'chats', chat.id, 'messages');
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });

      // Create or update chat document with last message
      await setDoc(doc(db, 'chats', chat.id), {
        lastMessage: textToSend,
        lastTimestamp: Date.now(),
        otherUserName: chat.otherUserName,
        avatar: chat.avatar,
        users: [user.uid, chat.otherUserId || chat.id].filter(Boolean),
        time: 'Just now',
        unread: false,
      }, { merge: true });
    } catch (e) {
      console.error('Send message failed', e);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && <Image source={{ uri: chat.avatar }} style={styles.miniAvatar} />}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={theme.colors.ink} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
            <View>
              <Text style={styles.headerName}>{chat.otherUserName}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}><Phone size={20} color={theme.colors.ink} /></Pressable>
          <Pressable style={styles.iconBtn}><MoreHorizontal size={20} color={theme.colors.ink} /></Pressable>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <Pressable style={styles.attachBtn}>
            <MapPin size={24} color={theme.colors.inkMute} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  headerStatus: {
    fontSize: 11,
    color: theme.colors.green,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: 20,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    maxWidth: '80%',
    gap: 8,
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: theme.colors.green,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: theme.colors.surface2,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
    fontWeight: '500',
  },
  theirText: {
    color: theme.colors.ink,
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface2,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: theme.colors.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: theme.colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  }
});
