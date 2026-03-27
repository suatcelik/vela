import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Budget, Category, MonthlySummary, Transaction } from '../types';

interface BudgetState {
  transactions: Transaction[];
  budgets: Budget[];
  currentMonth: string; // 'YYYY-MM'
  loading: boolean;

  // Computed
  monthlyIncome: () => number;
  monthlyExpense: () => number;
  monthlySummary: () => MonthlySummary;
  budgetProgress: (category: Category) => { spent: number; limit: number; percent: number };

  // Actions
  setMonth: (month: string) => void;
  fetchTransactions: (month?: string) => Promise<void>;
  fetchBudgets: (month?: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setCategoryBudget: (category: Category, limit: number) => Promise<void>;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  transactions: [],
  budgets: [],
  currentMonth: currentMonth(),
  loading: false,

  monthlyIncome: () =>
    get().transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),

  monthlyExpense: () =>
    get().transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),

  monthlySummary: () => {
    const { transactions, currentMonth: month } = get();
    const byCategory: Record<string, number> = {};
    let income = 0, expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else {
        expense += t.amount;
        byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
      }
    });
    return { month, total_income: income, total_expense: expense, net: income - expense, by_category: byCategory as any };
  },

  budgetProgress: (category) => {
    const { transactions, budgets } = get();
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((s, t) => s + t.amount, 0);
    const budget = budgets.find((b) => b.category === category);
    const limit = budget?.limit_amount ?? 0;
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    return { spent, limit, percent };
  },

  setMonth: (month) => {
    set({ currentMonth: month });
    get().fetchTransactions(month);
    get().fetchBudgets(month);
  },

  fetchTransactions: async (month) => {
    const m = month ?? get().currentMonth;
    set({ loading: true });

    // Yıl ve ayı parçalayarak o ayın son gününü buluyoruz (30, 31, 28, 29 vb.)
    const [year, monthStr] = m.split('-');
    const lastDay = new Date(parseInt(year), parseInt(monthStr), 0).getDate();

    const start = `${m}-01`;
    const end = `${m}-${String(lastDay).padStart(2, '0')}`;

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });
    set({ transactions: data ?? [], loading: false });
  },

  fetchBudgets: async (month) => {
    const m = month ?? get().currentMonth;
    const { data } = await supabase
      .from('budgets').select('*').eq('month', m);
    set({ budgets: data ?? [] });
  },

  addTransaction: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase
      .from('transactions')
      .insert({ ...data, user_id: user.id })
      .select().single();
    if (inserted) set((s) => ({ transactions: [inserted, ...s.transactions] }));
  },

  deleteTransaction: async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  setCategoryBudget: async (category, limit) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const month = get().currentMonth;
    const { data } = await supabase
      .from('budgets')
      .upsert({ user_id: user.id, category, limit_amount: limit, month }, { onConflict: 'user_id,category,month' })
      .select().single();
    if (data) {
      set((s) => ({
        budgets: s.budgets.some((b) => b.category === category)
          ? s.budgets.map((b) => b.category === category ? data : b)
          : [...s.budgets, data],
      }));
    }
  },
}));