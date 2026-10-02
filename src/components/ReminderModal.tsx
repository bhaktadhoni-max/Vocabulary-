import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  Calendar, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Play, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ReminderSettings } from '../types';
import { 
  getReminderSettings, 
  saveReminderSettings, 
  requestNotificationPermission, 
  sendPracticeNotification 
} from '../utils/reminder';
import { playSuccessChime } from '../utils/sound';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviewCount: number;
  onStartReview?: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  pendingReviewCount,
  onStartReview,
}) => {
  const [settings, setSettings] = useState<ReminderSettings>(getReminderSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSettings(getReminderSettings());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState('unsupported');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<ReminderSettings>) => {
    const updated = saveReminderSettings(partial);
    setSettings(updated);
  };

  const handleToggleBrowserNotifications = async () => {
    if (permissionState === 'granted') {
      handleUpdate({ browserNotification: !settings.browserNotification });
    } else {
      const granted = await requestNotificationPermission();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionState(Notification.permission);
      }
      if (granted) {
        handleUpdate({ browserNotification: true });
        playSuccessChime();
      }
    }
  };

  const handleSendTest = () => {
    if (permissionState !== 'granted') {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          setPermissionState('granted');
          const sent = sendPracticeNotification(pendingReviewCount, true);
          if (sent) {
            setTestSentMessage('ব্রাউজার নোটিফিকেশন পাঠানো হয়েছে!');
            setTimeout(() => setTestSentMessage(null), 3500);
          }
        }
      });
      return;
    }

    const sent = sendPracticeNotification(pendingReviewCount, true);
    if (sent) {
      setTestSentMessage('ব্রাউজার নোটিফিকেশন পাঠানো হয়েছে!');
    } else {
      setTestSentMessage('ইন-অ্যাপ রিমাইন্ডার সক্রিয় আছে');
    }
    setTimeout(() => setTestSentMessage(null), 3500);
  };

  return (
    <div 
      id="reminder-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-lg rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-bengali text-slate-900 dark:text-white flex items-center gap-2">
                <span>অনুশীলন রিমাইন্ডার সেটিংস</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                দুর্বল শব্দের নিয়মিত পুনরাবৃত্তি ও নোটিফিকেশন সূচি
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Status Box: Words Waiting for Review */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-bengali">
                  অনুশীলন তালিকা স্থিতি:
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-bengali">
                {pendingReviewCount > 0 
                  ? `${pendingReviewCount}টি শব্দ অনুশীলনের অপেক্ষায় রয়েছে` 
                  : 'বর্তমানে কোনো দুর্বল শব্দ অনুশীলনের তালিকায় নেই'}
              </p>
            </div>

            {pendingReviewCount > 0 && onStartReview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartReview();
                }}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-bengali text-xs shadow-sm transition flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <span>রিভিউ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Master Reminder Toggle */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer transition hover:border-indigo-500/50">
            <div className="space-y-0.5 pr-2">
              <span className="text-sm font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                দৈনিক ভোকাবুলারি রিমাইন্ডার চালু রাখুন
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                নির্ধারিত সময়ে দুর্বল শব্দ অনুশীলনের বার্তা ও অ্যাপ রিমাইন্ডার ব্যানার পাবেন
              </p>
            </div>
            <input
              id="toggle-master-reminder"
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleUpdate({ enabled: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          {/* Time & Frequency Controls */}
          {settings.enabled && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              
              {/* Preferred Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-bengali text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>পছন্দের অনুশীলনের সময় (Preferred Time):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-reminder-time"
                    type="time"
                    value={settings.time}
                    onChange={(e) => handleUpdate({ time: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali whitespace-nowrap bg-white dark:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {parseInt(settings.time.split(':')[0]) < 12 ? '🌅 সকাল' : parseInt(settings.time.split(':')[0]) < 17 ? '☀️ দুপুর' : '🌙 রাত'}
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold font-bengali text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>রিমাইন্ডারের পুনরাবৃত্তি (Frequency):</span>
                </label>
                <select
                  id="select-reminder-frequency"
                  value={settings.frequency}
                  onChange={(e) => handleUpdate({ frequency: e.target.value as any })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bengali font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="daily">প্রতিদিন (Daily - প্রস্তাবিত)</option>
                  <option value="twice_daily">দিনে ২ বার (সকাল ও রাত)</option>
                  <option value="every_2_days">প্রতি ২ দিন পরপর (Every 2 days)</option>
                </select>
              </div>

              {/* In-App Study Alerts Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200">
                    অ্যাপের ভেতর রিভিশন অ্যালার্ট
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                    অনুশীলনের শব্দ জমা থাকলে হোমপেজে নোটিশ প্রদর্শন করবে
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate({ inAppAlerts: settings.inAppAlerts === false ? true : false })}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    settings.inAppAlerts !== false ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle in-app reminder"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                      settings.inAppAlerts !== false ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          )}

          {/* Browser Notification Permission & Trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ব্রাউজার পুশ নোটিফিকেশন (Push Notifications)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                  ব্রাউজার বা স্ক্রিনে অ্যালার্ট মেসেজ পাওয়ার অনুমতি দিন
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleBrowserNotifications}
                className={`px-3 py-1.5 rounded-xl text-xs font-bengali font-bold transition flex items-center gap-1 cursor-pointer ${
                  settings.browserNotification && permissionState === 'granted'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                }`}
              >
                {permissionState === 'granted' && settings.browserNotification ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>অনুমোদিত</span>
                  </>
                ) : (
                  <span>অনুমতি দিন</span>
                )}
              </button>
            </div>

            {/* Test Notification Trigger */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                নোটিফিকেশন বার্তা পরীক্ষা করে দেখুন:
              </span>
              <button
                type="button"
                onClick={handleSendTest}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bengali font-semibold transition cursor-pointer"
              >
                <Play className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>টেস্ট বার্তা পাঠান</span>
              </button>
            </div>

            {testSentMessage && (
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 font-bengali text-center animate-in fade-in">
                {testSentMessage}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold font-bengali transition shadow-sm cursor-pointer"
          >
            সংরক্ষণ ও বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
