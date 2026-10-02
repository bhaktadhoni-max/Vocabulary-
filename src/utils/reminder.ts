import { ReminderSettings } from '../types';

const REMINDER_STORAGE_KEY = 'jlpt_n5_reminder_settings';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  time: '20:00', // Default 8:00 PM
  frequency: 'daily',
  browserNotification: false,
  inAppAlerts: true,
};

export const getReminderSettings = (): ReminderSettings => {
  try {
    const saved = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse reminder settings', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
};

export const saveReminderSettings = (settings: Partial<ReminderSettings>): ReminderSettings => {
  try {
    const current = getReminderSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save reminder settings', e);
    return DEFAULT_REMINDER_SETTINGS;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendPracticeNotification = (
  pendingCount: number,
  isTest = false
): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = isTest
      ? '🔔 JLPT N5 ভোকাবুলারি রিমাইন্ডার (টেস্ট)'
      : pendingCount > 0
      ? `📚 ${pendingCount}টি শব্দ অনুশীলনের অপেক্ষায়!`
      : '🌟 নিয়মিত জাপানি শব্দ চর্চার সময় হয়েছে!';

    const body = isTest
      ? 'আপনার রিমাইন্ডার সফলভাবে সক্রিয় করা হয়েছে। নিয়মিত অনুশীলন চালিয়ে যান!'
      : pendingCount > 0
      ? `আপনার 'Needs Practice' তালিকায় ${pendingCount}টি শব্দ রয়েছে। এখনই ৫ মিনিট রিভিশন দিয়ে নিন!`
      : 'প্রতিদিন কিছু নতুন শব্দ দেখে নিন এবং আপনার স্কোর বাড়িয়ে তুলুন!';

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'jlpt-study-reminder',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (e) {
    console.warn('Could not fire browser notification:', e);
    return false;
  }
};

const LAST_REMINDER_TRIGGER_KEY = 'jlpt_n5_last_reminder_trigger';

export const checkAndTriggerScheduledReminder = (pendingCount: number): boolean => {
  if (typeof window === 'undefined') return false;

  const settings = getReminderSettings();
  if (!settings.enabled || !settings.browserNotification) {
    return false;
  }

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayDateStr = now.toISOString().slice(0, 10);

  // Check if reminder was already sent today
  const lastTriggered = localStorage.getItem(LAST_REMINDER_TRIGGER_KEY);
  if (lastTriggered === todayDateStr) {
    return false;
  }

  // If current time matches or is past target time today
  if (currentTimeStr >= settings.time) {
    const sent = sendPracticeNotification(pendingCount);
    if (sent) {
      localStorage.setItem(LAST_REMINDER_TRIGGER_KEY, todayDateStr);
    }
    return sent;
  }

  return false;
};

