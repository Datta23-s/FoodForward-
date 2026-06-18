import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRwP_7RxxKefNgd2CTlZH1BH7U0WDujP8",
  authDomain: "foodforward-eafc3.firebaseapp.com",
  projectId: "foodforward-eafc3",
  storageBucket: "foodforward-eafc3.firebasestorage.app",
  messagingSenderId: "155249915282",
  appId: "1:155249915282:web:3b4d5eb3b3fe9090afbd4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
