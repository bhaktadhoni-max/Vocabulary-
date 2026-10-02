import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Play, 
  Check, 
  RotateCcw,
  Gauge,
  Mic,
  Music,
  Zap,
  Activity,
  Languages
} from 'lucide-react';
import { 
  VoiceSettings, 
  getVoiceSettings, 
  saveVoiceSettings, 
  getJapaneseVoices, 
  getBengaliVoices,
  speakJapanese,
  speakBangla,
  playSuccessChime 
} from '../utils/sound';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PHRASES = [
  { jp: 'こんにちは！よろしくお願いします。', bn: 'নমস্কার! আপনার সাথে পরিচিত হয়ে ভালো লাগলো।' },
  { jp: '日本語の勉強を楽しく続けましょう！', bn: 'জাপানি ভাষা শেখা আনন্দের সাথে চালিয়ে যাই!' },
  { jp: 'ありがとうございます。', bn: 'অনেক ধন্যবাদ।' },
  { jp: '私は日本へ行きたいです。', bn: 'আমি জাপানে যেতে চাই।' },
];

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(getVoiceSettings);
  const [japaneseVoices, setJapaneseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [bengaliVoices, setBengaliVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingSample, setIsPlayingSample] = useState<'ja' | 'bn' | null>(null);
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);

  // Load and refresh available voices
  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      setJapaneseVoices(getJapaneseVoices());
      setBengaliVoices(getBengaliVoices());
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveVoiceSettings(partial);
  };

  const handleTestJapanese = (text?: string) => {
    const phrase = text || SAMPLE_PHRASES[selectedSampleIdx].jp;
    setIsPlayingSample('ja');
    speakJapanese(phrase, {
      rate: settings.rate,
      pitch: settings.pitch,
      voiceURI: settings.voiceURI || undefined,
      onEnd: () => setIsPlayingSample(null),
      onError: () => setIsPlayingSample(null),
    });
  };

  const handleTestBangla = (text?: string) => {
    const phrase = text || SAMPLE_PHRASES[selectedSampleIdx].bn;
    setIsPlayingSample('bn');
    speakBangla(phrase, {
      rate: Math.min(settings.rate * 1.05, 1.1),
      pitch: settings.pitch,
      voiceURI: settings.bengaliVoiceURI || undefined,
      onEnd: () => setIsPlayingSample(null),
      onError: () => setIsPlayingSample(null),
    });
  };

  const handleResetDefaults = () => {
    const defaults: VoiceSettings = {
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0,
      voiceURI: null,
      bengaliVoiceURI: null,
      autoSpeakOnFlip: false,
      soundFxEnabled: true,
    };
    saveVoiceSettings(defaults);
    setSettings(defaults);
    playSuccessChime();
  };

  return (
    <div 
      id="voice-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-lg rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg font-bengali flex items-center gap-2">
                <span>দ্বিভাষিক অডিও সেটিংস</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  JP & BN
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                জাপানি ও বাংলা উচ্চারণের গতি ও স্পষ্টতা নিয়ন্ত্রণ
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
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* 1. Japanese Voice Engine */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>জাপানি ভয়েস ইঞ্জিন (Japanese Voice):</span>
              </label>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                {japaneseVoices.length > 0 ? `${japaneseVoices.length} টি সনাক্ত` : 'অটো'}
              </span>
            </div>

            <select
              id="select-japanese-voice"
              value={settings.voiceURI || ''}
              onChange={(e) => handleUpdate({ voiceURI: e.target.value || null })}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">স্বয়ংক্রিয় সেরা ন্যাচারাল ভয়েস (Auto Recommended)</option>
              {japaneseVoices.map((voice) => {
                const isNatural = voice.name.toLowerCase().includes('natural') || voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('kyoko');
                return (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang}) {isNatural ? '✨ [HD]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Speed (Rate) Controls */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>উচ্চারণের গতি (Playback Speed):</span>
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {settings.rate.toFixed(2)}x
              </span>
            </div>

            {/* Quick Speed Preset Chips */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ rate: 0.65 })}
                className={`py-2 px-2 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  Math.abs(settings.rate - 0.65) < 0.05
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="font-bold">🐢 ০.৬৫x</span>
                <span className="text-[10px] text-slate-400">ধীর</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 0.85 })}
                className={`py-2 px-2 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  Math.abs(settings.rate - 0.85) < 0.05
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="font-bold">🎧 ০.৮৫x</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">আদর্শ</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 1.0 })}
                className={`py-2 px-2 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  Math.abs(settings.rate - 1.0) < 0.05
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="font-bold">⚡ ১.০০x</span>
                <span className="text-[10px] text-slate-400">স্বাভাবিক</span>
              </button>
            </div>

            <input
              id="slider-voice-rate"
              type="range"
              min="0.5"
              max="1.3"
              step="0.05"
              value={settings.rate}
              onChange={(e) => handleUpdate({ rate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 3. Interactive Test Phrase Player */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-bengali text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                লাইভ টেস্ট প্লেয়ার:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTestJapanese()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm transition"
                >
                  <Play className={`w-3 h-3 ${isPlayingSample === 'ja' ? 'animate-spin' : ''}`} />
                  <span>জাপানি</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestBangla()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer shadow-sm transition"
                >
                  <Play className={`w-3 h-3 ${isPlayingSample === 'bn' ? 'animate-spin' : ''}`} />
                  <span>বাংলা</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {SAMPLE_PHRASES.slice(0, 2).map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSampleIdx(idx)}
                  className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    selectedSampleIdx === idx
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-japanese font-medium">{sample.jp}</p>
                    <p className="font-bengali text-[11px] text-slate-400">{sample.bn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Audio Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  কার্ড উল্টালে স্বয়ংক্রিয় উচ্চারণ (Auto-Speak)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                  ফ্লিপ করার সাথে সাথে স্বয়ংক্রিয়ভাবে পড়ে শোনাবে
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakOnFlip}
                onChange={(e) => handleUpdate({ autoSpeakOnFlip: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  অ্যাপ সাউন্ড ইফেক্টস (Action Chimes)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                  সঠিক উত্তর ও বাটনের মার্জিত সাউন্ড সংকেত
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundFxEnabled}
                onChange={(e) => {
                  handleUpdate({ soundFxEnabled: e.target.checked });
                  if (e.target.checked) playSuccessChime();
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ডিফল্ট</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-bengali transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
