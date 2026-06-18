import { useState, useEffect } from 'react';

/**
 * Parses an expiry value — either an ISO datetime string or a time string like "07:00 PM"
 * Returns a Date object for today at that time, or the parsed ISO date.
 */
export function parseExpiry(expiryValue) {
  if (!expiryValue) return null;

  // If it's already an ISO string
  if (expiryValue.includes('T') || expiryValue.includes('-')) {
    const d = new Date(expiryValue);
    return isNaN(d.getTime()) ? null : d;
  }

  // Try to parse a time like "07:00 PM" as today at that time
  const today = new Date();
  const match = expiryValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    today.setHours(hours, minutes, 0, 0);
    return today;
  }

  return null;
}

/**
 * Given an expiry Date, returns a human-readable label and urgency info.
 */
export function getTimeLeft(expiryDate) {
  if (!expiryDate) return { label: '', isExpired: false, isUrgent: false, minutes: Infinity };

  const now = new Date();
  const diffMs = expiryDate - now;

  if (diffMs <= 0) {
    return { label: 'Expired', isExpired: true, isUrgent: false, minutes: 0 };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let label = '';
  if (hours > 0) {
    label = `${hours}h ${minutes}m left`;
  } else {
    label = `${minutes}m left`;
  }

  return {
    label,
    isExpired: false,
    isUrgent: totalMinutes < 30,
    hours,
    minutes: totalMinutes,
  };
}

/**
 * React hook that updates every 30 seconds.
 * Usage: const countdown = useCountdown(listing.expiryISO);
 */
export function useCountdown(expiryValue) {
  const expiryDate = parseExpiry(expiryValue);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiryDate));

  useEffect(() => {
    if (!expiryDate) return;

    const tick = () => setTimeLeft(getTimeLeft(expiryDate));
    tick();

    const interval = setInterval(tick, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [expiryValue]);

  return timeLeft;
}
