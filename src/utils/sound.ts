// Ultra-Clear & Smooth Japanese Web Speech Audio & Synthesizer Sound Engine

export interface VoiceSettings {
  rate: number; // 0.5 to 1.5 (default 0.85 for optimal clarity)
  pitch: number; // 0.7 to 1.3 (default 1.0)
  volume: number; // 0.1 to 1.0 (default 1.0)
  voiceURI: string | null; // specific selected Japanese voice
  bengaliVoiceURI?: string | null; // specific selected Bengali voice
  autoSpeakOnFlip: boolean;
  soundFxEnabled: boolean;
}

const VOICE_SETTINGS_STORAGE_KEY = 'jlpt_n5_bn_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 0.85, // slightly relaxed for clear phonetics
  pitch: 1.0,
  volume: 1.0,
  voiceURI: null,
  bengaliVoiceURI: null,
  autoSpeakOnFlip: false,
  soundFxEnabled: true,
};

// Retrieve saved settings
export const getVoiceSettings = (): VoiceSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse voice settings:', e);
  }
  return DEFAULT_SETTINGS;
};

// Save settings and dispatch event for real-time reactivity
export const saveVoiceSettings = (settings: Partial<VoiceSettings>): VoiceSettings => {
  const current = getVoiceSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('voice-settings-changed', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save voice settings:', e);
  }
  return updated;
};

// Cached voices list
let cachedJapaneseVoices: SpeechSynthesisVoice[] = [];
let cachedBengaliVoices: SpeechSynthesisVoice[] = [];

// Helper to filter and prioritize the clearest natural Japanese voices
export const getJapaneseVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices();
  const jaVoices = allVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('ja') ||
      v.lang.toLowerCase().includes('jp') ||
      v.name.includes('Japanese') ||
      v.name.includes('日本語')
  );

  // Quality ranking: Neural / Natural / Premium voices at top
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('google') || name.includes('microsoft') || name.includes('apple')) score += 30;
    if (name.includes('nanami') || name.includes('keita') || name.includes('kyoko') || name.includes('otoya') || name.includes('sayaka') || name.includes('haruka')) score += 40;
    if (name.includes('enhanced') || name.includes('premium')) score += 25;
    if (v.lang === 'ja-JP' || v.lang === 'ja_JP') score += 10;
    if (v.default) score += 5;
    return score;
  };

  const sorted = [...jaVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  cachedJapaneseVoices = sorted;
  return sorted;
};

// Helper to filter and prioritize Bengali (Bangla) voices
export const getBengaliVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices();
  const bnVoices = allVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('bn') ||
      v.name.toLowerCase().includes('bengali') ||
      v.name.toLowerCase().includes('bangla') ||
      v.name.includes('বাংলা')
  );

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('google') || name.includes('microsoft') || name.includes('apple')) score += 30;
    if (v.lang.toLowerCase() === 'bn-bd' || v.lang.toLowerCase() === 'bn_bd') score += 20;
    if (v.lang.toLowerCase() === 'bn-in' || v.lang.toLowerCase() === 'bn_in') score += 15;
    if (v.default) score += 5;
    return score;
  };

  const sorted = [...bnVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  cachedBengaliVoices = sorted;
  return sorted;
};

// Auto-warm voices on startup
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getJapaneseVoices();
  getBengaliVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    getJapaneseVoices();
    getBengaliVoices();
  };
}

// Clean text for natural Japanese speech (remove brackets, furigana artifacts)
export const cleanJapaneseText = (raw: string): string => {
  return raw
    .replace(/\[.*?\]/g, '') // remove romaji brackets [yama]
    .replace(/\(.*?\)/g, '') // remove parentheses (やま)
    .replace(/（.*?）/g, '') // remove fullwidth parentheses
    .replace(/[・•]/g, ' ') // replace dots with subtle pauses
    .replace(/〜/g, 'ー') // normalize long vowel dash
    .trim();
};

// Clean text for natural Bangla speech
export const cleanBanglaText = (raw: string): string => {
  return raw
    .replace(/\[.*?\]/g, '') // remove brackets
    .replace(/\(.*?\)/g, '') // remove parentheses
    .replace(/（.*?）/g, '')
    .replace(/[/]/g, ', ') // slash to natural pause
    .trim();
};

export interface SpeakOptions {
  slow?: boolean; // if true, uses slower rate for extra clarity
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Main High-Clarity Japanese Speech Function
export const speakJapanese = (text: string, options: SpeakOptions = {}) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }

  try {
    // Cancel any ongoing speech cleanly
    window.speechSynthesis.cancel();

    const cleanText = cleanJapaneseText(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const settings = getVoiceSettings();

    // Configure rate: if 'slow' is requested, play at 0.65x for crystal-clear syllable study
    let playbackRate = options.rate ?? settings.rate;
    if (options.slow) {
      playbackRate = 0.65;
    }
    utterance.rate = Math.max(0.5, Math.min(playbackRate, 1.5));
    utterance.pitch = options.pitch ?? settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'ja-JP';

    // Find requested voice or best ranked Japanese voice
    const voices = getJapaneseVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    const targetURI = options.voiceURI ?? settings.voiceURI;
    if (targetURI) {
      selectedVoice = voices.find((v) => v.voiceURI === targetURI || v.name === targetURI);
    }

    // If no specific voice selected or found, use highest scored Japanese voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    // Speak
    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: keep synthesis active if it's longer
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (err) {
    console.warn('Japanese TTS error:', err);
    if (options.onError) options.onError(err);
  }
};

// High-Clarity Bangla (Bengali) Speech Function
export const speakBangla = (text: string, options: SpeakOptions = {}) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }

  try {
    // Cancel any ongoing speech cleanly
    window.speechSynthesis.cancel();

    const cleanText = cleanBanglaText(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const settings = getVoiceSettings();

    let playbackRate = options.rate ?? settings.rate;
    if (options.slow) {
      playbackRate = 0.75;
    }
    utterance.rate = Math.max(0.6, Math.min(playbackRate, 1.4));
    utterance.pitch = options.pitch ?? settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'bn-BD';

    const voices = getBengaliVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    const targetURI = options.voiceURI ?? settings.bengaliVoiceURI;
    if (targetURI) {
      selectedVoice = voices.find((v) => v.voiceURI === targetURI || v.name === targetURI);
    }

    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || 'bn-BD';
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (err) {
    console.warn('Bangla TTS error:', err);
    if (options.onError) options.onError(err);
  }
};

// Stop speech synthesis immediately
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// ============================================================================
// Web Audio API Synthesizer - Crisp, Studio-Grade Offline Sound Effects
// ============================================================================

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Pleasant Harmonic Double-Chime for Correct Answers / Mastery
export const playSuccessChime = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77 Hz) - harmonic fifth above
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.001, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Ignore audio glitches safely
  }
};

// Soft Encouraging Feedback for "Don't Know / Need Practice"
export const playReviewSound = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.14); // E4
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {}
};

// Soft Low Non-jarring Feedback for Incorrect Quiz Answers
export const playErrorSound = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.18); // F3
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
};

// Smooth Tactile Card Flip Sound with airy whoosh and crisp settle
export const playCardFlipSound = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Tone 1: Smooth airy rotational whoosh
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.exponentialRampToValueAtTime(560, now + 0.09);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Tone 2: Crisp tactile mechanical settle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(460, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.14);
    gain2.gain.setValueAtTime(0.001, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.17);
  } catch (e) {}
};

// Radiant Ascending Triad for High Streaks
export const playStreakChime = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (e) {}
};

// Pleasant Celestial Star Sparkle for Bookmarks
export const playBookmarkSound = () => {
  const settings = getVoiceSettings();
  if (!settings.soundFxEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {}
};

export const playAudioFX = (type: 'pop' | 'correct' | 'incorrect') => {
  if (type === 'pop') playCardFlipSound();
  else if (type === 'correct') playSuccessChime();
  else if (type === 'incorrect') playErrorSound();
};

export const stopAllSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};


