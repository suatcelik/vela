import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Debt, Contact, DebtType, DebtStatus } from '../types';

interface DebtState {
  debts: Debt[];
  contacts: Contact[];
  loading: boolean;

  // Computed
  totalCredit: () => number;
  totalDebt: () => number;
  netBalance: () => number;
  debtsByContact: (contactId: string) => Debt[];

  // Actions
  fetchAll: () => Promise<void>;
  addDebt: (data: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'paid_amount' | 'status'>) => Promise<void>;
  makePayment: (debtId: string, amount: number) => Promise<void>;
  deleteDebt: (debtId: string) => Promise<void>;

  // Contacts
  fetchContacts: () => Promise<void>;
  addContact: (name: string, phone?: string) => Promise<Contact | null>;
  deleteContact: (contactId: string) => Promise<void>;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  contacts: [],
  loading: false,

  totalCredit: () =>
    get().debts
      .filter((d) => d.type === 'credit' && d.status !== 'paid')
      .reduce((sum, d) => sum + (d.amount - d.paid_amount), 0),

  totalDebt: () =>
    get().debts
      .filter((d) => d.type === 'debt' && d.status !== 'paid')
      .reduce((sum, d) => sum + (d.amount - d.paid_amount), 0),

  netBalance: () => get().totalCredit() - get().totalDebt(),

  debtsByContact: (contactId) =>
    get().debts.filter((d) => d.contact_id === contactId),

  fetchAll: async () => {
    set({ loading: true });
    const [{ data: debts }, { data: contacts }] = await Promise.all([
      supabase
        .from('debts')
        .select('*, contact:contacts(*)')
        .order('created_at', { ascending: false }),
      supabase.from('contacts').select('*').order('name'),
    ]);
    set({
      debts: debts ?? [],
      contacts: contacts ?? [],
      loading: false,
    });
  },

  addDebt: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase
      .from('debts')
      .insert({ ...data, user_id: user.id, paid_amount: 0, status: 'open' })
      .select('*, contact:contacts(*)')
      .single();
    if (inserted) {
      set((s) => ({ debts: [inserted, ...s.debts] }));
    }
  },

  makePayment: async (debtId, amount) => {
    const debt = get().debts.find((d) => d.id === debtId);
    if (!debt) return;
    const newPaid = Math.min(debt.paid_amount + amount, debt.amount);
    const newStatus: DebtStatus =
      newPaid >= debt.amount ? 'paid' : newPaid > 0 ? 'partial' : 'open';
    const { data: updated } = await supabase
      .from('debts')
      .update({ paid_amount: newPaid, status: newStatus })
      .eq('id', debtId)
      .select('*, contact:contacts(*)')
      .single();
    if (updated) {
      set((s) => ({
        debts: s.debts.map((d) => (d.id === debtId ? updated : d)),
      }));
    }
  },

  deleteDebt: async (debtId) => {
    await supabase.from('debts').delete().eq('id', debtId);
    set((s) => ({ debts: s.debts.filter((d) => d.id !== debtId) }));
  },

  fetchContacts: async () => {
    const { data } = await supabase.from('contacts').select('*').order('name');
    set({ contacts: data ?? [] });
  },

  addContact: async (name, phone) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, name, phone: phone ?? null })
      .select()
      .single();
    if (data) set((s) => ({ contacts: [...s.contacts, data].sort((a, b) => a.name.localeCompare(b.name)) }));
    return data ?? null;
  },

  deleteContact: async (contactId) => {
    await supabase.from('contacts').delete().eq('id', contactId);
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== contactId) }));
  },
}));
