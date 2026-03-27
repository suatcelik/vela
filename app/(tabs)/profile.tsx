import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Radius, Shadow, Spacing } from '../../constants/theme';
import { initials } from '../../lib/formatters';
import { useAuthStore } from '../../stores/useAuthStore';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuthStore();
  const name = profile?.full_name ?? user?.email ?? 'Kullanıcı';

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: signOut },
    ]);
  };

  const items = [
    { icon: 'user', label: 'Ad Soyad', value: profile?.full_name ?? '—' },
    { icon: 'mail', label: 'E-posta', value: user?.email ?? '—' },
    { icon: 'dollar-sign', label: 'Para Birimi', value: profile?.currency ?? 'TRY' },
  ];

  const menuItems = [
    { icon: 'bell', label: 'Bildirimler' },
    { icon: 'moon', label: 'Dark Mode' },
    { icon: 'upload', label: 'Veriyi Dışa Aktar' },
    { icon: 'shield', label: 'Gizlilik Politikası' },
    { icon: 'message-circle', label: 'Destek' },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.navy900, Colors.navy800]} style={s.header}>
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initials(name)}</Text>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Hesap Bilgileri</Text>
          {items.map((item) => (
            <View key={item.label} style={s.infoRow}>
              <Feather name={item.icon as any} size={20} color={Colors.navy500} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>{item.label}</Text>
                <Text style={s.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Ayarlar</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={s.menuRow} activeOpacity={0.7}>
              <Feather name={item.icon as any} size={20} color={Colors.navy500} style={s.menuIcon} />
              <Text style={s.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color={Colors.red500} style={{ marginRight: 8 }} />
          <Text style={s.signOutTxt}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={s.version}>Vela v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  avatarWrap: { alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(0,200,150,0.2)', borderWidth: 2, borderColor: 'rgba(0,200,150,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarTxt: { fontFamily: Fonts.extraBold, fontSize: 26, color: Colors.green400 },
  name: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.white, letterSpacing: -0.5 },
  email: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  section: { backgroundColor: Colors.white, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.textMuted, letterSpacing: 0.08, textTransform: 'uppercase', padding: Spacing.lg, paddingBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border },
  infoIcon: { width: 24, textAlign: 'center' },
  infoLabel: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.textMuted },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textPrimary, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border },
  menuIcon: { width: 24, textAlign: 'center' },
  menuLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textPrimary, flex: 1 },
  signOutBtn: { backgroundColor: Colors.red100, borderRadius: Radius.xl, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  signOutTxt: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.red500 },
  version: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});