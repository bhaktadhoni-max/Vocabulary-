import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { N5VocabularySection } from './components/n5';
import { N4VocabularySection } from './components/n4';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { checkAndTriggerScheduledReminder } from './utils/reminder';

const THEME_STORAGE_KEY = 'jlpt_n5_theme';
const ACTIVE_SECTION_STORAGE_KEY = 'jlpt_active_section';
const N4_DEFAULT_APPLIED_KEY = 'jlpt_n4_default_applied_v1';

export function App() {
  const [activeSection, setActiveSection] = useState<'N4' | 'N5'>(() => {
    try {
      const applied = localStorage.getItem(N4_DEFAULT_APPLIED_KEY);
      if (!applied) {
        localStorage.setItem(N4_DEFAULT_APPLIED_KEY, 'true');
        localStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, 'N4');
        return 'N4';
      }
      const saved = localStorage.getItem(ACTIVE_SECTION_STORAGE_KEY);
      if (saved === 'N4' || saved === 'N5') return saved;
    } catch {}
    return 'N4'; // Default to JLPT N4!
  });

  const handleSwitchLevel = useCallback((lvl: 'N4' | 'N5') => {
    setActiveSection(lvl);
    try {
      localStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, lvl);
    } catch {}
  }, []);

  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 1. Light & Dark Mode System with LocalStorage & OS Preference detection
  // ---------------------------------------------------------------------------
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.warn('Theme update failed:', e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Background reminder interval check
  useEffect(() => {
    const runCheck = () => {
      try {
        checkAndTriggerScheduledReminder(5);
      } catch {}
    };

    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {activeSection === 'N5' ? (
        <N5VocabularySection
          activeLevel="N5"
          onSwitchLevel={handleSwitchLevel}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        />
      ) : (
        <N4VocabularySection
          activeLevel="N4"
          onSwitchLevel={handleSwitchLevel}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        />
      )}

      {/* Voice Settings Modal accessible from both N5 and N4 */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
