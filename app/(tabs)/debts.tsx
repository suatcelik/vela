import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebtStore } from '../../stores/useDebtStore';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatCurrency, formatDateShort, initials } from '../../lib/formatters';
import { Debt } from '../../types';

const AVATAR_COLORS = ['#1a6040', '#1a4080', '#602040', '#404010', '#204060'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function DebtsScreen() {
  const { debts, contacts, loading, fetchAll, addDebt, makePayment, deleteDebt,
    addContact, totalCredit, totalDebt } = useDebtStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debt'>('all');
  const [form, setForm] = useState({ contactName: '', amount: '', type: 'credit' as 'credit' | 'debt', due_date: '', description: '' });

  useEffect(() => { fetchAll(); }, []);

  const filtered = debts.filter((d) => filter === 'all' ? d.status !== 'paid' : d.type === filter && d.status !== 'paid');

  const handleAdd = async () => {
    if (!form.contactName || !form.amount) { Alert.alert('Hata', 'Kişi adı ve tutar zorunlu.'); return; }
    let contact = contacts.find((c) => c.name.toLowerCase() === form.contactName.toLowerCase());
    if (!contact) contact = (await addContact(form.contactName)) ?? undefined;
    if (!contact) return;
    await addDebt({ contact_id: contact.id, type: form.type, amount: parseFloat(form.amount),
      due_date: form.due_date || null, description: form.description || null, receipt_url: null });
    setShowAdd(false);
    setForm({ contactName: '', amount: '', type: 'credit', due_date: '', description: '' });
  };

  const handlePay = async () => {
    if (!showPay || !payAmount) return;
    await makePayment(showPay.id, parseFloat(payAmount));
    setShowPay(null); setPayAmount('');
  };

  const confirmDelete = (id: string) => Alert.alert('Sil', 'Bu kaydı silmek istediğine emin misin?',
    [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => deleteDebt(id) }]);

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.navy900, Colors.navy800]} style={s.header}>
        <Text style={s.headerTitle}>Borç / Alacak</Text>
        <View style={s.summaryRow}>
          <View style={[s.sumCard, { backgroundColor: 'rgba(0,200,150,0.1)', borderColor: 'rgba(0,200,150,0.2)' }]}>
            <Text style={s.sumLbl}>Toplam Alacak</Text>
            <Text style={[s.sumVal, { color: Colors.green400 }]}>{formatCurrency(totalCredit())}</Text>
          </View>
          <View style={[s.sumCard, { backgroundColor: 'rgba(240,64,96,0.1)', borderColor: 'rgba(240,64,96,0.2)' }]}>
            <Text style={s.sumLbl}>Toplam Borç</Text>
            <Text style={[s.sumVal, { color: '#f08090' }]}>{formatCurrency(totalDebt())}</Text>
          </View>
        </View>
        <View style={s.filterRow}>
          {(['all', 'credit', 'debt'] as const).map((f) => (
            <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>
                {f === 'all' ? 'Tümü' : f === 'credit' ? 'Alacak' : 'Borç'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={Colors.navy600} />}
        showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>💸</Text>
            <Text style={s.emptyTitle}>Kayıt yok</Text>
            <Text style={s.emptyDesc}>Sağ alttaki + ile ekle</Text>
          </View>
        ) : filtered.map((debt) => {
          const name = debt.contact?.name ?? 'Bilinmiyor';
          const remaining = debt.amount - debt.paid_amount;
          const progress = debt.amount > 0 ? (debt.paid_amount / debt.amount) * 100 : 0;
          const isCredit = debt.type === 'credit';
          return (
            <View key={debt.id} style={s.debtCard}>
              <View style={s.debtTop}>
                <View style={[s.avatar, { backgroundColor: avatarColor(name) }]}>
                  <Text style={s.avatarTxt}>{initials(name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.debtName}>{name}</Text>
                  {debt.due_date && <Text style={s.debtDate}>Vade: {formatDateShort(debt.due_date)}</Text>}
                </View>
                <View style={[s.badge, { backgroundColor: isCredit ? Colors.green100 : Colors.red100 }]}>
                  <Text style={[s.badgeTxt, { color: isCredit ? '#007a5a' : '#c03050' }]}>
                    {isCredit ? 'Alacak' : 'Borç'}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <Text style={s.totalAmt}>{formatCurrency(debt.amount)}</Text>
                {debt.paid_amount > 0 && <Text style={s.paidAmt}>{formatCurrency(debt.paid_amount)} ödendi</Text>}
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: isCredit ? Colors.green500 : Colors.red500 }]} />
              </View>
              {debt.description ? <Text style={s.desc}>{debt.description}</Text> : null}
              <View style={s.actions}>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: isCredit ? Colors.green100 : Colors.red100, flex: 1 }]}
                  onPress={() => { setShowPay(debt); setPayAmount(String(remaining.toFixed(2))); }}>
                  <Text style={[s.actionTxt, { color: isCredit ? '#007a5a' : '#c03050' }]}>
                    {isCredit ? '✓ Ödeme Al' : '✓ Ödeme Yap'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.red100, width: 36 }]} onPress={() => confirmDelete(debt.id)}>
                  <Text style={{ fontSize: 14 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Text style={s.fabTxt}>＋</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHdr}>
            <Text style={s.modalTitle}>Yeni Kayıt</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
            <View style={s.typeRow}>
              {(['credit', 'debt'] as const).map((t) => (
                <TouchableOpacity key={t} style={[s.typeBtn, form.type === t && s.typeBtnActive]} onPress={() => setForm((f) => ({ ...f, type: t }))}>
                  <Text style={[s.typeTxt2, form.type === t && { color: Colors.white }]}>
                    {t === 'credit' ? '📥 Alacak' : '📤 Borç'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {[
              { label: 'Kişi Adı', key: 'contactName', placeholder: 'Ahmet Yılmaz', caps: 'words' as const },
              { label: 'Tutar (₺)', key: 'amount', placeholder: '0.00', kb: 'numeric' as const },
              { label: 'Vade Tarihi', key: 'due_date', placeholder: '2026-04-15' },
              { label: 'Açıklama', key: 'description', placeholder: 'Kısa not...' },
            ].map(({ label, key, placeholder, caps, kb }) => (
              <View key={key} style={{ marginBottom: Spacing.lg }}>
                <Text style={s.fieldLabel}>{label}</Text>
                <TextInput style={s.field} placeholder={placeholder} keyboardType={kb ?? 'default'}
                  autoCapitalize={caps ?? 'none'}
                  value={(form as any)[key]} onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))} />
              </View>
            ))}
            <TouchableOpacity style={s.saveBtn} onPress={handleAdd}>
              <Text style={s.saveBtnTxt}>Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={!!showPay} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHdr}>
            <Text style={s.modalTitle}>Ödeme</Text>
            <TouchableOpacity onPress={() => setShowPay(null)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <View style={{ padding: Spacing.xl }}>
            <Text style={s.fieldLabel}>Tutar (₺)</Text>
            <TextInput style={s.field} keyboardType="numeric" value={payAmount} onChangeText={setPayAmount} />
            <TouchableOpacity style={[s.saveBtn, { marginTop: 24 }]} onPress={handlePay}>
              <Text style={s.saveBtnTxt}>Onayla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontFamily: Fonts.extraBold, fontSize: 22, color: Colors.white, marginBottom: Spacing.lg },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  sumCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1 },
  sumLbl: { fontFamily: Fonts.medium, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  sumVal: { fontFamily: Fonts.extraBold, fontSize: 18, letterSpacing: -0.5 },
  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.08)' },
  filterActive: { backgroundColor: Colors.white },
  filterTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  filterTxtActive: { color: Colors.navy700 },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
  emptyDesc: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted },
  debtCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.md },
  debtTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: Fonts.extraBold, fontSize: 14, color: Colors.white },
  debtName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary },
  debtDate: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  badgeTxt: { fontFamily: Fonts.bold, fontSize: 11 },
  totalAmt: { fontFamily: Fonts.extraBold, fontSize: 18, color: Colors.textPrimary },
  paidAmt: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted },
  progressTrack: { height: 5, backgroundColor: Colors.border, borderRadius: 100, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', borderRadius: 100 },
  desc: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: { height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { fontFamily: Fonts.bold, fontSize: 12 },
  fab: { position: 'absolute', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 18,
    backgroundColor: Colors.navy600, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  fabTxt: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.xl, paddingTop: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.textPrimary },
  modalClose: { fontSize: 20, color: Colors.textMuted },
  typeRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  typeBtn: { flex: 1, height: 44, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  typeBtnActive: { backgroundColor: Colors.navy700, borderColor: Colors.navy700 },
  typeTxt2: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textMuted },
  fieldLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  field: { height: 52, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.white },
  saveBtn: { height: 52, backgroundColor: Colors.navy600, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
