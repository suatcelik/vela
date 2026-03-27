import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDebtStore } from '../../stores/useDebtStore';
import { useAssetStore } from '../../stores/useAssetStore';
import { useBudgetStore } from '../../stores/useBudgetStore';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatCurrency, formatNumber, formatDateShort, initials, pctStr } from '../../lib/formatters';
import { ASSET_LABELS } from '../../constants/categories';

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const { debts, totalCredit, totalDebt, fetchAll: fetchDebts } = useDebtStore();
  const { fetchAssets, fetchRates, assetsWithValue, totalValue, totalPnL, totalPnLPercent } = useAssetStore();
  const { fetchTransactions, fetchBudgets, monthlyIncome, monthlyExpense } = useBudgetStore();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Kullanıcı';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const refreshAll = () => { fetchDebts(); fetchAssets(); fetchRates(); fetchTransactions(); fetchBudgets(); };
  useEffect(() => { refreshAll(); }, []);

  const assets = assetsWithValue().slice(0, 3);
  const recentDebts = debts.filter((d) => d.status !== 'paid').slice(0, 3);
  const portValue = totalValue();
  const pnl = totalPnL();
  const pnlPct = totalPnLPercent();
  const netWorth = portValue + totalCredit() - totalDebt();
  const netSavings = monthlyIncome() - monthlyExpense();

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.navy900, Colors.navy800]} style={s.header}>
        <View style={s.topRow}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initials(firstName)}</Text>
          </View>
        </View>
        <View style={s.netCard}>
          <Text style={s.netLbl}>Toplam Net Değer</Text>
          <Text style={s.netVal}>₺{formatNumber(netWorth, 2)}</Text>
          {pnl !== 0 && (
            <View style={[s.pnlBadge, { backgroundColor: pnl >= 0 ? 'rgba(0,200,150,0.15)' : 'rgba(240,64,96,0.15)', borderColor: pnl >= 0 ? 'rgba(0,200,150,0.3)' : 'rgba(240,64,96,0.3)' }]}>
              <Text style={[s.pnlTxt, { color: pnl >= 0 ? Colors.green400 : '#f08090' }]}>
                {pnl >= 0 ? '▲' : '▼'} Portföy {pctStr(pnlPct)}
              </Text>
            </View>
          )}
        </View>
        <View style={s.quickStats}>
          <View style={s.stat}>
            <Text style={[s.statVal, { color: Colors.green400 }]}>{formatCurrency(totalCredit())}</Text>
            <Text style={s.statLbl}>Alacak</Text>
          </View>
          <View style={[s.stat, s.statBorder]}>
            <Text style={[s.statVal, { color: '#f08090' }]}>{formatCurrency(totalDebt())}</Text>
            <Text style={s.statLbl}>Borç</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statVal, { color: netSavings >= 0 ? Colors.green400 : '#f08090' }]}>{formatCurrency(Math.abs(netSavings))}</Text>
            <Text style={s.statLbl}>{netSavings >= 0 ? 'Tasarruf' : 'Açık'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refreshAll} tintColor={Colors.navy600} />}
        showsVerticalScrollIndicator={false}>

        {assets.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Portföy</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}><Text style={s.seeAll}>Tümünü gör →</Text></TouchableOpacity>
            </View>
            {assets.map((asset) => {
              const info = ASSET_LABELS[asset.type];
              const isPos = asset.pnl >= 0;
              return (
                <View key={asset.id} style={[s.assetItem, { marginBottom: Spacing.sm }]}>
                  <View style={[s.assetIcon, { backgroundColor: info?.bg ?? Colors.bg }]}>
                    <Text style={{ fontSize: 18 }}>{info?.icon ?? '💎'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.assetName}>{asset.name}</Text>
                    <Text style={s.assetSub}>{formatNumber(asset.quantity, 4)} {asset.symbol}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.assetVal}>₺{formatNumber(asset.current_value, 2)}</Text>
                    <Text style={[s.assetPnl, { color: isPos ? Colors.green500 : Colors.red500 }]}>{isPos ? '+' : ''}{formatCurrency(asset.pnl)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {recentDebts.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Son Borç / Alacak</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/debts')}><Text style={s.seeAll}>Tümünü gör →</Text></TouchableOpacity>
            </View>
            <View style={s.debtPreview}>
              {recentDebts.map((debt, i) => {
                const name = debt.contact?.name ?? 'Bilinmiyor';
                const isCredit = debt.type === 'credit';
                return (
                  <View key={debt.id} style={[s.debtRow, i > 0 && { borderTopWidth: 1, borderColor: Colors.border }]}>
                    <View style={[s.debtAvatar, { backgroundColor: isCredit ? '#1a6040' : '#601a1a' }]}>
                      <Text style={{ fontFamily: Fonts.extraBold, fontSize: 11, color: Colors.white }}>{initials(name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.debtName}>{name}</Text>
                      {debt.due_date && <Text style={s.debtDate}>Vade: {formatDateShort(debt.due_date)}</Text>}
                    </View>
                    <Text style={[s.debtAmt, { color: isCredit ? Colors.green500 : Colors.red500 }]}>
                      {isCredit ? '+' : '-'}{formatCurrency(debt.amount - debt.paid_amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {assets.length === 0 && recentDebts.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>⚓</Text>
            <Text style={s.emptyTitle}>Vela'ya hoş geldin!</Text>
            <Text style={s.emptyDesc}>Portföy veya borç sekmesinden başlayabilirsin.</Text>
          </View>
        )}

        <View>
          <Text style={[s.sectionTitle, { marginBottom: Spacing.md }]}>Hızlı İşlemler</Text>
          <View style={s.actGrid}>
            {[
              { icon: '💸', label: 'Borç Ekle', tab: '/(tabs)/debts' },
              { icon: '📈', label: 'Varlık Ekle', tab: '/(tabs)/portfolio' },
              { icon: '💰', label: 'Harcama', tab: '/(tabs)/budget' },
              { icon: '👤', label: 'Profil', tab: '/(tabs)/profile' },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={s.actCard} onPress={() => router.push(item.tab as any)}>
                <Text style={{ fontSize: 26 }}>{item.icon}</Text>
                <Text style={s.actLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  greeting: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  name: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  avatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,200,150,0.2)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: Fonts.extraBold, fontSize: 16, color: Colors.green400 },
  netCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.md },
  netLbl: { fontFamily: Fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
  netVal: { fontFamily: Fonts.extraBold, fontSize: 32, color: Colors.white, letterSpacing: -1, marginBottom: Spacing.sm },
  pnlBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 3, alignSelf: 'flex-start' },
  pnlTxt: { fontFamily: Fonts.semiBold, fontSize: 11 },
  quickStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.lg, overflow: 'hidden' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 2 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statVal: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  statLbl: { fontFamily: Fonts.regular, fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 32 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary },
  seeAll: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.navy600 },
  assetItem: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadow.sm },
  assetIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  assetName: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.textPrimary },
  assetSub: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  assetVal: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.textPrimary },
  assetPnl: { fontFamily: Fonts.semiBold, fontSize: 10, marginTop: 2 },
  debtPreview: { backgroundColor: Colors.white, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  debtAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  debtName: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textPrimary },
  debtDate: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  debtAmt: { fontFamily: Fonts.bold, fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: Spacing.md },
  emptyTitle: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.textPrimary },
  emptyDesc: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
  actGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  actCard: { width: '47%', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, ...Shadow.sm },
  actLabel: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },
});
