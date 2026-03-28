import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'vela_settings_v1';

interface SettingsState {
  initialized: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  initialize: () => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
}

type PersistedSettings = {
  notificationsEnabled: boolean;
  darkMode: boolean;
};

const defaultSettings: PersistedSettings = {
  notificationsEnabled: true,
  darkMode: false,
};

async function saveSettings(settings: PersistedSettings) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  initialized: false,
  notificationsEnabled: defaultSettings.notificationsEnabled,
  darkMode: defaultSettings.darkMode,

  initialize: async () => {
    if (get().initialized) return;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
        set({
          notificationsEnabled: parsed.notificationsEnabled ?? defaultSettings.notificationsEnabled,
          darkMode: parsed.darkMode ?? defaultSettings.darkMode,
          initialized: true,
        });
        return;
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }

    set({ ...defaultSettings, initialized: true });
  },

  setNotificationsEnabled: async (value) => {
    set({ notificationsEnabled: value });
    await saveSettings({
      notificationsEnabled: value,
      darkMode: get().darkMode,
    });
  },

  setDarkMode: async (value) => {
    set({ darkMode: value });
    await saveSettings({
      notificationsEnabled: get().notificationsEnabled,
      darkMode: value,
    });
  },
}));
