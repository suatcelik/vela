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

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ session, user: session.user, profile, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }

    // Listen to auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ session, user: session.user, profile });
      } else {
        set({ session: null, user: null, profile: null });
      }
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    const sanitizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error && data.user) {
      // Supabase veritabanı trigger'ının UI'ı bekletmesini önlemek için optimistic update yapıyoruz.
      set({
        user: data.user,
        session: data.session,
        profile: {
          id: data.user.id,
          full_name: fullName,
          avatar_url: null,
          currency: 'TRY', // Varsayılan para birimi
          created_at: new Date().toISOString()
        }
      });
    }
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    const { data: updated } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    if (updated) set({ profile: updated });
  },
}));

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data ?? null;
}