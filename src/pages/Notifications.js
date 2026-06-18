import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Animated, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Bell, MessageSquare, Info, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { GlassView } from '../components/GlassView';
import { Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Notifications({ onBack }) {
  const { notifications, setNotifications } = useAppContext();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNotificationPress = (notif) => {
    if (notif.unread && setNotifications) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    }
    Alert.alert(notif.title, notif.message, [{ text: 'OK' }]);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={20} color={theme.colors.green} />;
      case 'message': return <MessageSquare size={20} color={theme.colors.blue} />;
      case 'info': return <Info size={20} color="#6366f1" />;
      default: return <Bell size={20} color={theme.colors.inkMute} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={theme.colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <Animated.ScrollView 
        style={[styles.scroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Pressable key={notif.id} style={[styles.notifCard, notif.unread && styles.unreadCard]} onPress={() => handleNotificationPress(notif)}>
              <View style={[styles.iconBox, { backgroundColor: notif.unread ? theme.colors.surface2 : '#fff' }]}>
                {getIcon(notif.type)}
                {notif.unread && <View style={styles.dot} />}
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifText}>{notif.message}</Text>
              </View>
              <ChevronRight size={16} color={theme.colors.border} />
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>All quiet here</Text>
            <Text style={styles.emptySub}>We'll notify you about claims, messages, and updates here.</Text>
          </View>
        )}
      </Animated.ScrollView>
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
    borderRadius: 0,
    borderWidth: 0,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  unreadCard: {
    borderColor: 'transparent',
    backgroundColor: theme.colors.surface,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.red,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  notifTime: {
    fontSize: 11,
    color: theme.colors.inkMute,
    fontWeight: '600',
  },
  notifText: {
    fontSize: 13,
    color: theme.colors.inkSoft,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.ink,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.inkMute,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});
