import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudgetStore } from '../../stores/useBudgetStore';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatCurrency, formatMonthLabel, formatDateShort } from '../../lib/formatters';
import { CATEGORIES } from '../../constants/categories';
import { Category, TransactionType } from '../../types';

const CAT_KEYS = Object.keys(CATEGORIES) as Category[];

export default function BudgetScreen() {
  const { transactions, loading, currentMonth, monthlyIncome, monthlyExpense,
    monthlySummary, budgetProgress, setMonth, fetchTransactions, fetchBudgets,
    addTransaction, deleteTransaction, setCategoryBudget } = useBudgetStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [form, setForm] = useState({ type: 'expense' as TransactionType, amount: '', category: 'genel' as Category, description: '' });
  const [budgetForm, setBudgetForm] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'overview' | 'list'>('overview');

  useEffect(() => { fetchTransactions(); fetchBudgets(); }, []);

  const summary = monthlySummary();
  const net = summary.net;

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleAdd = async () => {
    if (!form.amount) return;
    await addTransaction({ type: form.type, amount: parseFloat(form.amount), category: form.category, description: form.description || null, date: new Date().toISOString().split('T')[0], receipt_url: null });
    setShowAdd(false);
    setForm({ type: 'expense', amount: '', category: 'genel', description: '' });
  };

  const handleSaveBudgets = async () => {
    await Promise.all(CAT_KEYS.filter((k) => budgetForm[k]).map((k) => setCategoryBudget(k, parseFloat(budgetForm[k]))));
    setShowBudget(false);
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#062040', '#0a3060']} style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Bütçe</Text>
          <TouchableOpacity style={s.budgetSetBtn} onPress={() => setShowBudget(true)}>
            <Text style={s.budgetSetTxt}>Limitler ✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Month selector */}
        <View style={s.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={s.monthArrow}><Text style={s.monthArrowTxt}>‹</Text></TouchableOpacity>
          <Text style={s.monthLabel}>{formatMonthLabel(currentMonth)}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.monthArrow}><Text style={s.monthArrowTxt}>›</Text></TouchableOpacity>
        </View>

        {/* Summary cards */}
        <View style={s.sumRow}>
          <View style={s.sumCard}>
            <Text style={s.sumLbl}>Gelir</Text>
            <Text style={[s.sumVal, { color: Colors.green400 }]}>{formatCurrency(monthlyIncome())}</Text>
          </View>
          <View style={s.sumCard}>
            <Text style={s.sumLbl}>Gider</Text>
            <Text style={[s.sumVal, { color: '#f08090' }]}>{formatCurrency(monthlyExpense())}</Text>
          </View>
        </View>

        {/* Net bar */}
        <View style={s.netBar}>
          <View style={s.netBarRow}>
            <Text style={s.netBarLbl}>Net Tasarruf</Text>
            <Text style={[s.netBarVal, { color: net >= 0 ? Colors.green400 : '#f08090' }]}>{formatCurrency(net)}</Text>
          </View>
          <View style={s.netTrack}>
            <View style={[s.netFill, {
              width: `${Math.min(Math.abs(monthlyIncome()) > 0 ? (monthlyExpense() / monthlyIncome()) * 100 : 0, 100)}%`,
              backgroundColor: net >= 0 ? Colors.green500 : Colors.red500,
            }]} />
          </View>
        </View>

        {/* Tab */}
        <View style={s.tabRow}>
          {(['overview', 'list'] as const).map((t) => (
            <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t === 'overview' ? 'Kategoriler' : 'İşlemler'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { fetchTransactions(); fetchBudgets(); }} tintColor={Colors.navy600} />}
        showsVerticalScrollIndicator={false}>

        {tab === 'overview' ? (
          CAT_KEYS.filter((k) => (summary.by_category as any)[k] > 0 || budgetProgress(k).limit > 0).map((cat) => {
            const info = CATEGORIES[cat];
            const { spent, limit, percent } = budgetProgress(cat);
            const over = percent >= 90;
            return (
              <View key={cat} style={s.catCard}>
                <View style={s.catRow}>
                  <View style={[s.catIcon, { backgroundColor: info.bg }]}>
                    <Text style={{ fontSize: 16 }}>{info.icon}</Text>
                  </View>
                  <Text style={s.catName}>{info.label}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.catSpent}>{formatCurrency(spent)}</Text>
                    {limit > 0 && <Text style={s.catLimit}>/ {formatCurrency(limit)}</Text>}
                  </View>
                </View>
                {limit > 0 && (
                  <View style={s.catTrack}>
                    <View style={[s.catFill, {
                      width: `${percent}%`,
                      backgroundColor: over ? Colors.red500 : percent > 60 ? '#f5c842' : Colors.green500,
                    }]} />
                  </View>
                )}
              </View>
            );
          })
        ) : (
          transactions.map((tx) => {
            const cat = CATEGORIES[tx.category];
            const isIncome = tx.type === 'income';
            return (
              <TouchableOpacity key={tx.id} style={s.txCard} onLongPress={() => deleteTransaction(tx.id)} activeOpacity={0.85}>
                <View style={[s.txIcon, { backgroundColor: cat?.bg ?? Colors.bg }]}>
                  <Text style={{ fontSize: 16 }}>{cat?.icon ?? '📦'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txDesc}>{tx.description || cat?.label || 'İşlem'}</Text>
                  <Text style={s.txDate}>{formatDateShort(tx.date)} · {cat?.label}</Text>
                </View>
                <Text style={[s.txAmt, { color: isIncome ? Colors.green500 : Colors.red500 }]}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {tab === 'list' && transactions.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>💰</Text>
            <Text style={s.emptyTitle}>İşlem yok</Text>
            <Text style={s.emptyDesc}>+ ile gelir veya gider ekle</Text>
          </View>
        )}
        <Text style={s.hint}>Uzun basarak işlem silebilirsiniz</Text>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Text style={s.fabTxt}>＋</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHdr}>
            <Text style={s.modalTitle}>İşlem Ekle</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
            <View style={s.typeRow}>
              {(['expense', 'income'] as const).map((t) => (
                <TouchableOpacity key={t} style={[s.typeBtn, form.type === t && s.typeBtnActive]} onPress={() => setForm((f) => ({ ...f, type: t }))}>
                  <Text style={[s.typeTxt, form.type === t && { color: Colors.white }]}>{t === 'expense' ? '📤 Gider' : '📥 Gelir'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={s.fieldLabel}>Tutar (₺)</Text>
              <TextInput style={s.field} placeholder="0.00" keyboardType="numeric" value={form.amount} onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))} />
            </View>

            {form.type === 'expense' && (
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={s.fieldLabel}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    {CAT_KEYS.map((k) => {
                      const info = CATEGORIES[k];
                      return (
                        <TouchableOpacity key={k} style={[s.catChip, form.category === k && s.catChipActive]} onPress={() => setForm((f) => ({ ...f, category: k }))}>
                          <Text style={{ fontSize: 16 }}>{info.icon}</Text>
                          <Text style={[s.catChipTxt, form.category === k && { color: Colors.white }]}>{info.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={s.fieldLabel}>Açıklama (opsiyonel)</Text>
              <TextInput style={s.field} placeholder="Market alışverişi..." value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} />
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleAdd}>
              <Text style={s.saveBtnTxt}>Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Limits Modal */}
      <Modal visible={showBudget} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHdr}>
            <Text style={s.modalTitle}>Kategori Limitleri</Text>
            <TouchableOpacity onPress={() => setShowBudget(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
            {CAT_KEYS.filter((k) => k !== 'genel' && k !== 'diger').map((k) => {
              const info = CATEGORIES[k];
              const { limit } = budgetProgress(k);
              return (
                <View key={k} style={{ marginBottom: Spacing.lg }}>
                  <Text style={s.fieldLabel}>{info.icon} {info.label}</Text>
                  <TextInput style={s.field} placeholder={limit > 0 ? String(limit) : 'Limit yok'}
                    keyboardType="numeric" value={budgetForm[k] ?? (limit > 0 ? String(limit) : '')}
                    onChangeText={(v) => setBudgetForm((f) => ({ ...f, [k]: v }))} />
                </View>
              );
            })}
            <TouchableOpacity style={s.saveBtn} onPress={handleSaveBudgets}>
              <Text style={s.saveBtnTxt}>Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerTitle: { fontFamily: Fonts.extraBold, fontSize: 22, color: Colors.white },
  budgetSetBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  budgetSetTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginBottom: Spacing.md },
  monthArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthArrowTxt: { fontSize: 22, color: 'rgba(255,255,255,0.6)' },
  monthLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  sumRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  sumCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sumLbl: { fontFamily: Fonts.medium, fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
  sumVal: { fontFamily: Fonts.extraBold, fontSize: 18, letterSpacing: -0.5 },
  netBar: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  netBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  netBarLbl: { fontFamily: Fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  netBarVal: { fontFamily: Fonts.bold, fontSize: 14 },
  netTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' },
  netFill: { height: '100%', borderRadius: 100 },
  tabRow: { flexDirection: 'row', gap: Spacing.sm },
  tabBtn: { flex: 1, height: 32, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: Colors.white },
  tabTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  tabTxtActive: { color: Colors.navy700 },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },
  catCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 8 },
  catIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  catName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary, flex: 1 },
  catSpent: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary },
  catLimit: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted },
  catTrack: { height: 4, backgroundColor: Colors.border, borderRadius: 100, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 100 },
  txCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadow.sm },
  txIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textPrimary },
  txDate: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  txAmt: { fontFamily: Fonts.bold, fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
  emptyDesc: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted },
  hint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 18, backgroundColor: Colors.navy600, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  fabTxt: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.textPrimary },
  modalClose: { fontSize: 20, color: Colors.textMuted },
  typeRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  typeBtn: { flex: 1, height: 44, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  typeBtnActive: { backgroundColor: Colors.navy700, borderColor: Colors.navy700 },
  typeTxt: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textMuted },
  catChip: { alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  catChipActive: { backgroundColor: Colors.navy700, borderColor: Colors.navy700 },
  catChipTxt: { fontFamily: Fonts.semiBold, fontSize: 10, color: Colors.textMuted },
  fieldLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  field: { height: 52, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg, fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.white },
  saveBtn: { height: 52, backgroundColor: Colors.navy600, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
