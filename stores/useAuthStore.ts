import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<() => void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ session, user: session.user, profile, initialized: true });
      } else {
        set({ session: null, user: null, profile: null, initialized: true });
      }
    } catch {
      set({ session: null, user: null, profile: null, initialized: true });
    }

    if (!authSubscription) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({ session, user: session.user, profile, initialized: true });
        } else {
          set({ session: null, user: null, profile: null, initialized: true });
        }
      });

      authSubscription = subscription;
    }

    return () => {
      authSubscription?.unsubscribe();
      authSubscription = null;
    };
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      return { error: mapAuthError(error?.message) };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (error) {
        return { error: mapAuthError(error.message) };
      }

      const needsEmailConfirmation = !data.session;

      if (data.session?.user) {
        set({
          user: data.session.user,
          session: data.session,
          profile: {
            id: data.session.user.id,
            full_name: fullName.trim(),
            avatar_url: null,
            currency: 'TRY',
            created_at: new Date().toISOString(),
          },
        });
      } else {
        set({ user: null, session: null, profile: null });
      }

      return {
        error: null,
        needsEmailConfirmation,
      };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profil güncelleme hatası:', error);
      return;
    }

    if (updated) set({ profile: updated });
  },
}));

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    console.error('Profil çekme hatası:', error);
    return null;
  }

  return data ?? null;
}

function mapAuthError(message?: string | null) {
  if (!message) return null;

  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'E-posta adresin doğrulanmamış. Gelen kutunu ve spam klasörünü kontrol et.';
  }
  if (normalized.includes('invalid login credentials')) {
    return 'E-posta veya şifre hatalı.';
  }
  if (normalized.includes('user already registered')) {
    return 'Bu e-posta ile zaten kayıt olunmuş.';
  }
  if (normalized.includes('password should be at least')) {
    return 'Şifre en az 6 karakter olmalı.';
  }

  return message;
}
