import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../utils/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  increment,
  setDoc,
} from 'firebase/firestore';
// import * as Notifications from 'expo-notifications';

// ─── Notification setup (Mocked for Expo Go compatibility) ────────────────────
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
*/

async function registerForPushNotifications() {
  console.log('Notifications: Push notifications mocked for Expo Go compatibility.');
  return null;
}

async function scheduleLocalNotification(title, body) {
  console.log('Notifications Local Notification (Mocked):', title, body);
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ── Register notifications on mount ─────────────────────────────────────────
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...userData, uid: fbUser.uid });
          setRole(userData.role);
        } else {
          const nameFromEmail = fbUser.email ? fbUser.email.split('@')[0] : 'Hero';
          const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
          setUser({
            email: fbUser.email,
            uid: fbUser.uid,
            name: capitalizedName,
            location: 'Koregaon Park, Pune',
            bio: 'Passionate about zero-waste. 100+ meals delivered since 2024.',
            phone: '',
            joined: 'Jan 2024',
            impact: 0,
            streak: 0,
          });
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return unsubscribe;
  }, []);

  // ── Firestore listings listener ───────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fbListings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (fbListings.length > 0) {
        setListings(fbListings);
      }
    });
    return unsubscribe;
  }, []);

  // ── Persist role to AsyncStorage ─────────────────────────────────────────
  useEffect(() => {
    if (role) AsyncStorage.setItem('ff_role', role).catch(() => {});
  }, [role]);

  // ─────────────────────────────────────────────────────────────────────────
  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      await AsyncStorage.removeItem('ff_role');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  // ── Add listing ───────────────────────────────────────────────────────────
  const addListing = async (listing) => {
    try {
      const emojis = ['🍲', '🥪', '🍎', '🥤', '🍞', '🥗'];
      const newListing = {
        ...listing,
        donor: user?.name || 'Anonymous',
        donorId: user?.uid || 'anon',
        donorPhone: user?.phone || '',
        status: 'Live',
        createdAt: new Date().toISOString(),
        emoji: listing.emoji || emojis[Math.floor(Math.random() * emojis.length)],
        distance: listing.distance || '0.8 km',
        // Use exact GPS coords — NO jitter
        lat: listing.lat || 18.5204,
        lng: listing.lng || 73.8567,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        // Store expiry as ISO if it's already an ISO, else keep as-is
        expiryISO: listing.expiryISO || null,
        tags: listing.tags || [],
        image: listing.image || null,
      };

      await addDoc(collection(db, 'listings'), newListing);

      // ── Increment donor impact score ────────────────────────────────────
      if (user?.uid) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            { impact: increment(5), streak: increment(1) },
            { merge: true }
          );
        } catch (e) { /* silent */ }
      }

      setNotifications((prev) => [
        {
          id: Date.now(),
          title: 'Listing Posted! 🎉',
          message: `Your "${listing.title}" is now live and visible to people nearby.`,
          time: 'Just now',
          type: 'success',
          unread: true,
        },
        ...prev,
      ]);

      scheduleLocalNotification('Listing Live! 🌿', `"${listing.title}" is visible to nearby receivers.`);
    } catch (e) {
      console.error('Add listing failed', e);
    }
  };

  const claimListing = async (id, needsDelivery = false, receiverInfo = null) => {
    const newStatus = 'Claimed_Direct';
    const claimData = {
      receiverName: receiverInfo?.name || user?.name || 'Receiver',
      receiverPhone: receiverInfo?.phone || user?.phone || '',
    };

    // Optimistic local update
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, ...claimData } : l))
    );

    try {
      await updateDoc(doc(db, 'listings', id.toString()), {
        status: newStatus,
        claimedBy: user?.uid || 'simulated_user',
        claimedAt: new Date().toISOString(),
        ...claimData,
      });

      // ── Increment receiver impact ─────────────────────────────────────
      if (user?.uid) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            { impact: increment(3) },
            { merge: true }
          );
        } catch (e) { /* silent */ }
      }
    } catch (e) {
      console.warn('Firebase sync bypassed (Simulation Mode)', e.message);
    }

    // Local notification for donor (in a real app this'd be a Cloud Function push)
    scheduleLocalNotification('Food Claimed! 🤝', 'Someone has claimed your listing. Check your dashboard.');
  };

  return (
    <AppContext.Provider
      value={{
        role, setRole,
        user, setUser,
        listings, addListing,
        claimListing,
        notifications,
        setNotifications,
        login, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
