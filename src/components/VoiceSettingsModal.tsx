import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Sliders, 
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

  const handleUpdate = (updated: Partial<VoiceSettings>) => {
    const next = saveVoiceSettings(updated);
    setSettings(next);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/95 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl shadow-black/90 border border-slate-700/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-bengali flex items-center gap-2">
                <span>দ্বিভাষিক অডিও ও ভয়েস সেটিংস</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  JP & BN TTS
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-bengali">
                জাপানি শব্দ এবং বাংলা অর্থ উচ্চারণের স্পষ্টতা ও গতি নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* 1. Japanese Voice Engine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>জাপানি ভয়েস ইঞ্জিন (Japanese Voice):</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400">
                {japaneseVoices.length > 0 ? `${japaneseVoices.length} টি ভয়েস সনাক্ত` : 'অটো ডিটেক্ট'}
              </span>
            </div>

            <select
              id="select-japanese-voice"
              value={settings.voiceURI || ''}
              onChange={(e) => handleUpdate({ voiceURI: e.target.value || null })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="">স্বয়ংক্রিয় সেরা ন্যাচারাল ভয়েস (Auto-Recommended)</option>
              {japaneseVoices.map((voice) => {
                const isNatural = voice.name.toLowerCase().includes('natural') || voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('kyoko');
                return (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang}) {isNatural ? '✨ [Natural HD]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Bengali Voice Engine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>বাংলা ভয়েস ইঞ্জিন (Bengali Voice):</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400">
                {bengaliVoices.length > 0 ? `${bengaliVoices.length} টি ভয়েস সনাক্ত` : 'বাংলা ডিটেক্ট'}
              </span>
            </div>

            <select
              id="select-bengali-voice"
              value={settings.bengaliVoiceURI || ''}
              onChange={(e) => handleUpdate({ bengaliVoiceURI: e.target.value || null })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">স্বয়ংক্রিয় বাংলা ন্যাচারাল ভয়েস (Auto Bengali)</option>
              {bengaliVoices.map((voice) => {
                return (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-400 font-bengali">
              * ফ্লিপকার্ডের সামনের অংশে চাপলে জাপানি শব্দ শোনাবে এবং উল্টো অংশে বাংলা অর্থ শোনাবে।
            </p>
          </div>

          {/* 3. Speed (Rate) Controls with Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>উচ্চারণের গতি (Playback Speed):</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {settings.rate.toFixed(2)}x
              </span>
            </div>

            {/* Quick Speed Preset Chips */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ rate: 0.65 })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 ${
                  Math.abs(settings.rate - 0.65) < 0.05
                    ? 'bg-blue-600/30 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🐢 ০.৬৫x</span>
                <span className="text-[10px] text-slate-400">ধীর ও স্পষ্ট</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 0.85 })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 ${
                  Math.abs(settings.rate - 0.85) < 0.05
                    ? 'bg-blue-600/30 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🎧 ০.৮৫x</span>
                <span className="text-[10px] text-cyan-300 font-semibold">মসৃণ (সেরা)</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 1.0 })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 ${
                  Math.abs(settings.rate - 1.0) < 0.05
                    ? 'bg-blue-600/30 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-bold flex items-center gap-1">⚡ ১.০০x</span>
                <span className="text-[10px] text-slate-400">নেটিভ স্পিড</span>
              </button>
            </div>

            {/* Fine slider */}
            <input
              id="slider-voice-rate"
              type="range"
              min="0.5"
              max="1.3"
              step="0.05"
              value={settings.rate}
              onChange={(e) => handleUpdate({ rate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* 4. Pitch & Volume Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pitch */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-bengali text-slate-300 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  স্বরের তীক্ষ্ণতা (Pitch)
                </span>
                <span className="font-mono text-cyan-400">{settings.pitch.toFixed(1)}</span>
              </div>
              <input
                id="slider-voice-pitch"
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.pitch}
                onChange={(e) => handleUpdate({ pitch: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Volume */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-bengali text-slate-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  ভলিউম (Volume)
                </span>
                <span className="font-mono text-cyan-400">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                id="slider-voice-volume"
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* 5. Interactive Test Phrase Player */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/40 border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-bengali text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                ভয়েস টেস্ট প্লেয়ার (Live Test Pronunciation):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestJapanese()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition"
                >
                  <Play className={`w-3 h-3 ${isPlayingSample === 'ja' ? 'animate-spin' : ''}`} />
                  <span>জাপানি টেস্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestBangla()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
                >
                  <Play className={`w-3 h-3 ${isPlayingSample === 'bn' ? 'animate-spin' : ''}`} />
                  <span>বাংলা টেস্ট</span>
                </button>
              </div>
            </div>

            {/* Sample Selector */}
            <div className="space-y-1.5">
              {SAMPLE_PHRASES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSampleIdx(idx);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    selectedSampleIdx === idx
                      ? 'bg-blue-900/30 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-japanese font-medium text-slate-100">{sample.jp}</p>
                    <p className="font-bengali text-[11px] text-slate-400">{sample.bn}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestJapanese(sample.jp);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-cyan-300 border border-slate-800"
                    >
                      JP
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestBangla(sample.bn);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-300 border border-slate-800"
                    >
                      BN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Audio Toggle Options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {/* Auto Speak on Flip */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  কার্ড উল্টালে স্বয়ংক্রিয় উচ্চারণ (Auto-Speak on Card Flip)
                </span>
                <p className="text-[11px] text-slate-400 font-bengali">
                  সামনের অংশে জাপানি এবং উল্টালে বাংলা অর্থ স্বয়ংক্রিয়ভাবে পড়ে শোনাবে
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakOnFlip}
                onChange={(e) => handleUpdate({ autoSpeakOnFlip: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
              />
            </label>

            {/* Sound FX */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  অ্যাপ সাউন্ড ইফেক্টস (Crisp Action Chimes)
                </span>
                <p className="text-[11px] text-slate-400 font-bengali">
                  কুইজের সঠিক উত্তর ও ফ্লিপকার্ডে স্টুডিও-গ্রেড সাউন্ড সংকেত
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundFxEnabled}
                onChange={(e) => {
                  handleUpdate({ soundFxEnabled: e.target.checked });
                  if (e.target.checked) playSuccessChime();
                }}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট সেটিংস</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-bengali transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>সংরক্ষণ করুন ও বন্ধ করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
