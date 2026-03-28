import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadow, Spacing } from '../constants/theme';

const SUPPORT_EMAIL = 'support@velaapp.app';

export default function SupportScreen() {
  const openMail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Vela Destek Talebi')}`;
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert('Mail uygulaması açılamadı', `Bize şu adresten yazabilirsin: ${SUPPORT_EMAIL}`);
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Feather name="arrow-left" size={22} color={Colors.textPrimary} onPress={() => router.back()} />
        <Text style={s.title}>Destek</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.heading}>Yardıma mı ihtiyacın var?</Text>
          <Text style={s.description}>
            Hesap, veri senkronizasyonu veya uygulama hatalarıyla ilgili bize mail gönderebilirsin.
          </Text>

          <TouchableOpacity style={s.primaryButton} onPress={openMail} activeOpacity={0.85}>
            <Feather name="mail" size={18} color={Colors.white} />
            <Text style={s.primaryButtonText}>Mail uygulamasını aç</Text>
          </TouchableOpacity>

          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Destek e-postası</Text>
            <Text style={s.infoValue}>{SUPPORT_EMAIL}</Text>
          </View>

          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Yanıt süresi</Text>
            <Text style={s.infoValue}>Genellikle 1-3 iş günü</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  title: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
  content: { padding: Spacing.xl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm },
  heading: { fontFamily: Fonts.extraBold, fontSize: 20, color: Colors.textPrimary, marginBottom: Spacing.sm },
  description: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22, color: Colors.textSecondary, marginBottom: Spacing.xl },
  primaryButton: {
    height: 52, borderRadius: Radius.lg, backgroundColor: Colors.navy700,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryButtonText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  infoBox: { backgroundColor: Colors.surface2, borderRadius: Radius.lg, padding: Spacing.lg, marginTop: Spacing.md },
  infoLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textPrimary },
});
