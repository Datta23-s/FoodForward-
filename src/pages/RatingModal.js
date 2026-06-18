import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';

export default function RatingModal({ visible, onClose, listing, reviewerId }) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Please select a rating', 'Tap a star to rate the donor.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        listingId: listing?.id,
        donorId: listing?.donorId,
        reviewerId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Thank you! ⭐', 'Your rating helps the community.');
      onClose();
      setRating(0);
      setComment('');
    } catch (e) {
      Alert.alert('Error', 'Could not submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Rate the Donation</Text>
          <Text style={styles.sub}>
            How was the food from{' '}
            <Text style={{ fontWeight: '800', color: colors.ink }}>{listing?.donor}</Text>?
          </Text>

          {/* Star Row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Star
                  size={36}
                  color={star <= rating ? colors.amber : colors.border}
                  fill={star <= rating ? colors.amber : 'none'}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : ['', 'Poor 😕', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'][rating]}
          </Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)..."
            placeholderTextColor={colors.inkMute}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          <Button loading={loading} onPress={handleSubmit} style={{ width: '100%', marginTop: 12 }}>
            Submit Rating
          </Button>
          <Pressable onPress={onClose} style={{ marginTop: 16, padding: 10 }}>
            <Text style={{ color: colors.inkMute, fontWeight: '600', textAlign: 'center' }}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 40,
      alignItems: 'center',
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.ink,
      marginBottom: 6,
    },
    sub: {
      fontSize: 14,
      color: colors.inkMute,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    starBtn: {
      padding: 4,
    },
    ratingLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.inkSoft,
      marginBottom: 20,
    },
    commentInput: {
      width: '100%',
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      fontSize: 14,
      color: colors.ink,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
