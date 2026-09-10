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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-[#e8e2d4] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#e8e2d4] flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f4f9ea] text-[#558b2f] border border-[#d6eab9]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-bengali flex items-center gap-2">
                <span>দ্বিভাষিক অডিও ও ভয়েস সেটিংস</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#f4f9ea] text-[#558b2f] border border-[#d6eab9]">
                  JP & BN TTS
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-bengali">
                জাপানি শব্দ এবং বাংলা অর্থ উচ্চারণের স্পষ্টতা ও গতি নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-[#e8e2d4] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* 1. Japanese Voice Engine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-[#558b2f]" />
                <span>জাপানি ভয়েস ইঞ্জিন (Japanese Voice):</span>
              </label>
              <span className="text-[11px] font-mono text-[#558b2f]">
                {japaneseVoices.length > 0 ? `${japaneseVoices.length} টি ভয়েস সনাক্ত` : 'অটো ডিটেক্ট'}
              </span>
            </div>

            <select
              id="select-japanese-voice"
              value={settings.voiceURI || ''}
              onChange={(e) => handleUpdate({ voiceURI: e.target.value || null })}
              className="w-full bg-[#faf8f5] border border-[#e2dcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#558b2f] focus:ring-1 focus:ring-[#558b2f] cursor-pointer"
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
              <label className="text-xs font-bold font-bengali text-slate-800 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#558b2f]" />
                <span>বাংলা ভয়েস ইঞ্জিন (Bengali Voice):</span>
              </label>
              <span className="text-[11px] font-mono text-[#558b2f]">
                {bengaliVoices.length > 0 ? `${bengaliVoices.length} টি ভয়েস সনাক্ত` : 'বাংলা ডিটেক্ট'}
              </span>
            </div>

            <select
              id="select-bengali-voice"
              value={settings.bengaliVoiceURI || ''}
              onChange={(e) => handleUpdate({ bengaliVoiceURI: e.target.value || null })}
              className="w-full bg-[#faf8f5] border border-[#e2dcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#558b2f] focus:ring-1 focus:ring-[#558b2f] cursor-pointer"
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
            <p className="text-[11px] text-slate-500 font-bengali">
              * ফ্লিপকার্ডের সামনের অংশে চাপলে জাপানি শব্দ শোনাবে এবং উল্টো অংশে বাংলা অর্থ শোনাবে।
            </p>
          </div>

          {/* 3. Speed (Rate) Controls with Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-bengali text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#558b2f]" />
                <span>উচ্চারণের গতি (Playback Speed):</span>
              </label>
              <span className="text-xs font-mono font-bold text-[#558b2f] bg-[#f4f9ea] px-2 py-0.5 rounded border border-[#d6eab9]">
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
                    ? 'bg-[#f4f9ea] border-[#558b2f] text-slate-900 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-[#e2dcd0] hover:bg-slate-50'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🐢 ০.৬৫x</span>
                <span className="text-[10px] text-slate-500">ধীর ও স্পষ্ট</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 0.85 })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 ${
                  Math.abs(settings.rate - 0.85) < 0.05
                    ? 'bg-[#f4f9ea] border-[#558b2f] text-slate-900 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-[#e2dcd0] hover:bg-slate-50'
                }`}
              >
                <span className="font-bold flex items-center gap-1">🎧 ০.৮৫x</span>
                <span className="text-[10px] text-[#558b2f] font-semibold">মসৃণ (সেরা)</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ rate: 1.0 })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bengali transition flex flex-col items-center gap-0.5 ${
                  Math.abs(settings.rate - 1.0) < 0.05
                    ? 'bg-[#f4f9ea] border-[#558b2f] text-slate-900 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-[#e2dcd0] hover:bg-slate-50'
                }`}
              >
                <span className="font-bold flex items-center gap-1">⚡ ১.০০x</span>
                <span className="text-[10px] text-slate-500">নেটিভ স্পিড</span>
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
              className="w-full h-1.5 bg-[#e8e2d4] rounded-lg appearance-none cursor-pointer accent-[#558b2f]"
            />
          </div>

          {/* 4. Pitch & Volume Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pitch */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-bengali text-slate-800 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#558b2f]" />
                  স্বরের তীক্ষ্ণতা (Pitch)
                </span>
                <span className="font-mono text-[#558b2f]">{settings.pitch.toFixed(1)}</span>
              </div>
              <input
                id="slider-voice-pitch"
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.pitch}
                onChange={(e) => handleUpdate({ pitch: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[#e8e2d4] rounded-lg appearance-none cursor-pointer accent-[#558b2f]"
              />
            </div>

            {/* Volume */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold font-bengali text-slate-800 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#558b2f]" />
                  ভলিউম (Volume)
                </span>
                <span className="font-mono text-[#558b2f]">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                id="slider-voice-volume"
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[#e8e2d4] rounded-lg appearance-none cursor-pointer accent-[#558b2f]"
              />
            </div>
          </div>

          {/* 5. Interactive Test Phrase Player */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-bengali text-[#558b2f] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                ভয়েস টেস্ট প্লেয়ার (Live Test Pronunciation):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestJapanese()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#558b2f] hover:bg-[#467326] text-white font-bold text-xs shadow-2xs active:scale-95 transition"
                >
                  <Play className={`w-3 h-3 ${isPlayingSample === 'ja' ? 'animate-spin' : ''}`} />
                  <span>জাপানি টেস্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestBangla()}
                  disabled={isPlayingSample !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-2xs active:scale-95 transition"
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
                      ? 'bg-[#f4f9ea] border-[#558b2f] text-slate-900'
                      : 'bg-white border-[#e2dcd0] text-slate-700 hover:bg-[#faf7f0]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-japanese font-medium text-slate-900">{sample.jp}</p>
                    <p className="font-bengali text-[11px] text-slate-500">{sample.bn}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestJapanese(sample.jp);
                      }}
                      className="px-2 py-0.5 rounded bg-[#f4f9ea] hover:bg-[#e9f4d7] text-[10px] text-[#558b2f] border border-[#d6eab9]"
                    >
                      JP
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestBangla(sample.bn);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 border border-slate-200"
                    >
                      BN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Audio Toggle Options */}
          <div className="space-y-2 pt-2 border-t border-[#e8e2d4]">
            {/* Auto Speak on Flip */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#e8e2d4] hover:bg-[#f5f0e6] cursor-pointer transition">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  কার্ড উল্টালে স্বয়ংক্রিয় উচ্চারণ (Auto-Speak on Card Flip)
                </span>
                <p className="text-[11px] text-slate-500 font-bengali">
                  সামনের অংশে জাপানি এবং উল্টালে বাংলা অর্থ স্বয়ংক্রিয়ভাবে পড়ে শোনাবে
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakOnFlip}
                onChange={(e) => handleUpdate({ autoSpeakOnFlip: e.target.checked })}
                className="w-5 h-5 rounded bg-white border-slate-300 text-[#558b2f] focus:ring-[#558b2f] cursor-pointer"
              />
            </label>

            {/* Sound FX */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#e8e2d4] hover:bg-[#f5f0e6] cursor-pointer transition">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-bengali text-slate-800 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#558b2f]" />
                  অ্যাপ সাউন্ড ইফেক্টস (Crisp Action Chimes)
                </span>
                <p className="text-[11px] text-slate-500 font-bengali">
                  কুইজের সঠিক উত্তর ও ফ্লিপকার্ডে মার্জিত সাউন্ড সংকেত
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundFxEnabled}
                onChange={(e) => {
                  handleUpdate({ soundFxEnabled: e.target.checked });
                  if (e.target.checked) playSuccessChime();
                }}
                className="w-5 h-5 rounded bg-white border-slate-300 text-[#558b2f] focus:ring-[#558b2f] cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e8e2d4] bg-[#faf8f5] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#e2dcd0] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট সেটিংস</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#558b2f] hover:bg-[#467326] text-white text-xs font-bold font-bengali transition shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
