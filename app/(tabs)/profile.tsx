import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Fonts, Radius, Shadow, Spacing } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { initials } from '../../lib/formatters';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

const lightPalette = {
  background: Colors.bg,
  card: Colors.white,
  cardAlt: Colors.surface2,
  text: Colors.textPrimary,
  textMuted: Colors.textMuted,
  textSecondary: Colors.textSecondary,
  border: Colors.border,
  headerStart: Colors.navy900,
  headerEnd: Colors.navy800,
  accent: Colors.navy500,
  danger: Colors.red500,
  dangerSoft: Colors.red100,
};

const darkPalette = {
  background: '#08111f',
  card: '#101b2d',
  cardAlt: '#162338',
  text: '#f5f9ff',
  textMuted: '#8ea6c8',
  textSecondary: '#c4d3e8',
  border: '#22314a',
  headerStart: '#020918',
  headerEnd: '#0a1f42',
  accent: '#8ab4ff',
  danger: '#ff6b86',
  dangerSoft: '#2c1720',
};

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuthStore();
  const { notificationsEnabled, darkMode, setNotificationsEnabled, setDarkMode } = useSettingsStore();
  const [exporting, setExporting] = useState(false);

  const theme = useMemo(() => (darkMode ? darkPalette : lightPalette), [darkMode]);
  const name = profile?.full_name ?? user?.email ?? 'Kullanıcı';

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleExportData = async () => {
    try {
      setExporting(true);

      const [
        profileRes,
        contactsRes,
        debtsRes,
        assetsRes,
        transactionsRes,
        budgetsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').maybeSingle(),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('debts').select('*, contact:contacts(*)').order('created_at', { ascending: false }),
        supabase.from('assets').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*').order('month', { ascending: false }),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        account: {
          email: user?.email ?? null,
          profile: profileRes.data ?? null,
        },
        contacts: contactsRes.data ?? [],
        debts: debtsRes.data ?? [],
        assets: assetsRes.data ?? [],
        transactions: transactionsRes.data ?? [],
        budgets: budgetsRes.data ?? [],
      };

      const data = JSON.stringify(payload, null, 2);
      await Share.share({
        title: 'Vela Verileri',
        message: Platform.OS === 'ios' ? 'Vela verileriniz dışa aktarılmaya hazır.' : data,
      });

      if (Platform.OS === 'ios') {
        Alert.alert('Dışa aktarma hazır', 'iOS üzerinde paylaşım ekranı açıldı. JSON içeriğini dosyaya kaydetmek için notlar veya dosyalar uygulamasını seçebilirsin.');
      }
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      Alert.alert('Hata', 'Veriler dışa aktarılırken bir sorun oluştu.');
    } finally {
      setExporting(false);
    }
  };

  const items = [
    { icon: 'user', label: 'Ad Soyad', value: profile?.full_name ?? '—' },
    { icon: 'mail', label: 'E-posta', value: user?.email ?? '—' },
    { icon: 'dollar-sign', label: 'Para Birimi', value: profile?.currency ?? 'TRY' },
  ];

  const menuItems = [
    {
      icon: 'bell',
      label: 'Bildirimler',
      type: 'switch' as const,
      value: notificationsEnabled,
      onToggle: async (value: boolean) => {
        await setNotificationsEnabled(value);
        Alert.alert('Bildirimler', value ? 'Bildirimler açıldı.' : 'Bildirimler kapatıldı.');
      },
    },
    {
      icon: 'moon',
      label: 'Dark Mode',
      type: 'switch' as const,
      value: darkMode,
      onToggle: async (value: boolean) => {
        await setDarkMode(value);
      },
    },
    {
      icon: 'upload',
      label: 'Veriyi Dışa Aktar',
      type: 'action' as const,
      onPress: handleExportData,
      loading: exporting,
    },
    {
      icon: 'shield',
      label: 'Gizlilik Politikası',
      type: 'link' as const,
      onPress: () => router.push('/privacy-policy'),
    },
    {
      icon: 'message-circle',
      label: 'Destek',
      type: 'link' as const,
      onPress: () => router.push('/support'),
    },
  ];

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <LinearGradient colors={[theme.headerStart, theme.headerEnd]} style={s.header}>
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initials(name)}</Text>
          </View>
          <Text style={[s.name, { color: '#fff' }]}>{name}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: theme.card }]}> 
          <Text style={[s.sectionTitle, { color: theme.textMuted }]}>Hesap Bilgileri</Text>
          {items.map((item) => (
            <View key={item.label} style={[s.infoRow, { borderColor: theme.border }]}> 
              <Feather name={item.icon as any} size={20} color={theme.accent} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { color: theme.textMuted }]}>{item.label}</Text>
                <Text style={[s.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[s.section, { backgroundColor: theme.card }]}> 
          <Text style={[s.sectionTitle, { color: theme.textMuted }]}>Ayarlar</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, { borderColor: theme.border }]}
              activeOpacity={item.type === 'switch' ? 1 : 0.7}
              onPress={item.type === 'switch' ? undefined : item.onPress}
            >
              <Feather name={item.icon as any} size={20} color={theme.accent} style={s.menuIcon} />
              <Text style={[s.menuLabel, { color: theme.text }]}>{item.label}</Text>

              {item.type === 'switch' ? (
                <Switch value={item.value} onValueChange={item.onToggle} />
              ) : item.loading ? (
                <ActivityIndicator size="small" color={theme.accent} />
              ) : (
                <Feather name="chevron-right" size={20} color={theme.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.signOutBtn, { backgroundColor: theme.dangerSoft }]} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color={theme.danger} style={{ marginRight: 8 }} />
          <Text style={[s.signOutTxt, { color: theme.danger }]}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: theme.textMuted }]}>Vela v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  avatarWrap: { alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(0,200,150,0.2)', borderWidth: 2, borderColor: 'rgba(0,200,150,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarTxt: { fontFamily: Fonts.extraBold, fontSize: 26, color: Colors.green400 },
  name: { fontFamily: Fonts.extraBold, fontSize: 20, letterSpacing: -0.5 },
  email: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  section: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.08, textTransform: 'uppercase', padding: Spacing.lg, paddingBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1 },
  infoIcon: { width: 24, textAlign: 'center' },
  infoLabel: { fontFamily: Fonts.medium, fontSize: 11 },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 14, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1 },
  menuIcon: { width: 24, textAlign: 'center' },
  menuLabel: { fontFamily: Fonts.semiBold, fontSize: 14, flex: 1 },
  signOutBtn: { borderRadius: Radius.xl, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  signOutTxt: { fontFamily: Fonts.bold, fontSize: 15 },
  version: { fontFamily: Fonts.regular, fontSize: 12, textAlign: 'center' },
});
