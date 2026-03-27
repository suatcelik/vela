import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAssetStore } from '../../stores/useAssetStore';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatCurrency, formatNumber, pctStr } from '../../lib/formatters';
import { ASSET_LABELS } from '../../constants/categories';
import { AssetType } from '../../types';

const ASSET_TYPES: AssetType[] = ['gold', 'usd', 'eur', 'gbp', 'btc', 'eth', 'custom'];

export default function PortfolioScreen() {
  const { loading, ratesLoading, rates, fetchAssets, fetchRates, addAsset, deleteAsset,
    assetsWithValue, totalValue, totalPnL, totalPnLPercent } = useAssetStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'gold' as AssetType, name: '', symbol: '', quantity: '', buy_price: '' });

  useEffect(() => { fetchAssets(); fetchRates(); }, []);

  const assets = assetsWithValue();
  const pnl = totalPnL();
  const pnlPct = totalPnLPercent();
  const isPos = pnl >= 0;

  // Donut distribution
  const total = totalValue();
  const distribution = assets.map((a) => ({
    ...a,
    pct: total > 0 ? (a.current_value / total) * 100 : 0,
  }));

  const COLORS = ['#f5c842', '#00c896', '#3a70c0', '#f04060', '#a060f0', '#60c0a0', '#c08040'];

  const handleAdd = async () => {
    const info = ASSET_LABELS[form.type];
    await addAsset({
      type: form.type,
      name: form.name || info.label,
      symbol: form.symbol || form.type.toUpperCase(),
      quantity: parseFloat(form.quantity) || 0,
      buy_price: parseFloat(form.buy_price) || 0,
      bought_at: new Date().toISOString().split('T')[0],
      note: null,
    });
    setShowAdd(false);
    setForm({ type: 'gold', name: '', symbol: '', quantity: '', buy_price: '' });
  };

  const confirmDelete = (id: string) => Alert.alert('Sil', 'Bu varlığı silmek istediğine emin misin?',
    [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => deleteAsset(id) }]);

  return (
    <View style={s.container}>
      <LinearGradient colors={['#051830', '#0a2850']} style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Portföy</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => fetchRates()}>
            <Text style={s.addBtnTxt}>{ratesLoading ? '⟳' : '↻'}</Text>
          </TouchableOpacity>
        </View>

        {/* Rate ticker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.ticker} contentContainerStyle={{ gap: 16 }}>
          {rates && [
            { sym: 'XAU', val: rates.XAU, label: 'gr Altın' },
            { sym: 'USD', val: rates.USD, label: 'Dolar' },
            { sym: 'EUR', val: rates.EUR, label: 'Euro' },
            { sym: 'BTC', val: rates.BTC, label: 'Bitcoin' },
          ].map(({ sym, val, label }) => (
            <View key={sym} style={s.tickerItem}>
              <Text style={s.tickerSym}>{label}</Text>
              <Text style={s.tickerVal}>₺{formatNumber(val, 2)}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Total */}
        <View style={{ alignItems: 'center', marginVertical: Spacing.lg }}>
          <Text style={s.totalLbl}>Toplam Portföy Değeri</Text>
          <Text style={s.totalVal}>₺{formatNumber(total, 2)}</Text>
          <View style={[s.pnlBadge, { backgroundColor: isPos ? 'rgba(0,200,150,0.15)' : 'rgba(240,64,96,0.15)', borderColor: isPos ? 'rgba(0,200,150,0.3)' : 'rgba(240,64,96,0.3)' }]}>
            <Text style={[s.pnlTxt, { color: isPos ? Colors.green400 : '#f08090' }]}>
              {isPos ? '▲' : '▼'} {formatCurrency(Math.abs(pnl))} ({pctStr(pnlPct)})
            </Text>
          </View>
        </View>

        {/* Donut legend */}
        {distribution.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {distribution.map((a, i) => (
              <View key={a.id} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
                <Text style={s.legendTxt}>{ASSET_LABELS[a.type]?.icon ?? '💎'} {a.name} {a.pct.toFixed(0)}%</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { fetchAssets(); fetchRates(); }} tintColor={Colors.navy600} />}
        showsVerticalScrollIndicator={false}>
        {assets.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📈</Text>
            <Text style={s.emptyTitle}>Henüz varlık yok</Text>
            <Text style={s.emptyDesc}>+ ile ilk varlığını ekle</Text>
          </View>
        ) : assets.map((asset, i) => {
          const info = ASSET_LABELS[asset.type];
          const isPos = asset.pnl >= 0;
          return (
            <TouchableOpacity key={asset.id} style={s.assetCard} onLongPress={() => confirmDelete(asset.id)} activeOpacity={0.85}>
              <View style={[s.assetIcon, { backgroundColor: info?.bg ?? '#f0f4fa' }]}>
                <Text style={{ fontSize: 20 }}>{info?.icon ?? '💎'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.assetName}>{asset.name}</Text>
                <Text style={s.assetQty}>{formatNumber(asset.quantity, 4)} {asset.symbol}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.assetVal}>₺{formatNumber(asset.current_value, 2)}</Text>
                <View style={[s.pnlBadgeSm, { backgroundColor: isPos ? Colors.green100 : Colors.red100 }]}>
                  <Text style={[s.pnlTxtSm, { color: isPos ? '#007a5a' : '#c03050' }]}>
                    {isPos ? '▲' : '▼'} {pctStr(asset.pnl_percent)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <Text style={s.hint}>Uzun basarak varlık silebilirsiniz</Text>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Text style={s.fabTxt}>＋</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHdr}>
            <Text style={s.modalTitle}>Varlık Ekle</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
            {/* Type selector */}
            <Text style={s.fieldLabel}>Varlık Türü</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.xl }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {ASSET_TYPES.map((t) => {
                  const info = ASSET_LABELS[t];
                  return (
                    <TouchableOpacity key={t} style={[s.typeChip, form.type === t && s.typeChipActive]} onPress={() => setForm((f) => ({ ...f, type: t, name: info.label }))}>
                      <Text style={{ fontSize: 18 }}>{info.icon}</Text>
                      <Text style={[s.typeChipTxt, form.type === t && { color: Colors.white }]}>{info.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {[
              { label: 'Miktar', key: 'quantity', placeholder: '12.5' },
              { label: 'Alış Fiyatı (₺)', key: 'buy_price', placeholder: '6800.00' },
            ].map(({ label, key, placeholder }) => (
              <View key={key} style={{ marginBottom: Spacing.lg }}>
                <Text style={s.fieldLabel}>{label}</Text>
                <TextInput style={s.field} placeholder={placeholder} keyboardType="numeric"
                  value={(form as any)[key]} onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))} />
              </View>
            ))}

            <TouchableOpacity style={s.saveBtn} onPress={handleAdd}>
              <Text style={s.saveBtnTxt}>Varlık Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerTitle: { fontFamily: Fonts.extraBold, fontSize: 22, color: Colors.white },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  addBtnTxt: { fontSize: 18, color: Colors.white },
  ticker: { marginBottom: Spacing.sm },
  tickerItem: { alignItems: 'center' },
  tickerSym: { fontFamily: Fonts.medium, fontSize: 10, color: 'rgba(255,255,255,0.45)' },
  tickerVal: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.white },
  totalLbl: { fontFamily: Fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
  totalVal: { fontFamily: Fonts.extraBold, fontSize: 34, color: Colors.white, letterSpacing: -1, marginBottom: 8 },
  pnlBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 4 },
  pnlTxt: { fontFamily: Fonts.bold, fontSize: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontFamily: Fonts.medium, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
  emptyDesc: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted },
  assetCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadow.md },
  assetIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  assetName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary },
  assetQty: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  assetVal: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 4 },
  pnlBadgeSm: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  pnlTxtSm: { fontFamily: Fonts.bold, fontSize: 10 },
  hint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 18, backgroundColor: Colors.navy600, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  fabTxt: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: 56, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.textPrimary },
  modalClose: { fontSize: 20, color: Colors.textMuted },
  fieldLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  field: { height: 52, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg, fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.white },
  typeChip: { alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  typeChipActive: { backgroundColor: Colors.navy700, borderColor: Colors.navy700 },
  typeChipTxt: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.textMuted },
  saveBtn: { height: 52, backgroundColor: Colors.navy600, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
