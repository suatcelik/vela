import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Shadow, Spacing } from '../constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Feather name="arrow-left" size={22} color={Colors.textPrimary} onPress={() => router.back()} />
        <Text style={s.title}>Gizlilik Politikası</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.sectionTitle}>Toplanan veriler</Text>
          <Text style={s.paragraph}>
            Vela; profil bilgileriniz, borç/alacak kayıtlarınız, bütçe hareketleriniz ve portföy verilerinizi sadece
            uygulama deneyimini sağlamak için saklar.
          </Text>

          <Text style={s.sectionTitle}>Veri kullanımı</Text>
          <Text style={s.paragraph}>
            Verileriniz hesabınızla ilişkilendirilir ve sadece size ait kayıtları göstermek, düzenlemek ve yedeklemek amacıyla kullanılır.
          </Text>

          <Text style={s.sectionTitle}>Üçüncü taraf servisler</Text>
          <Text style={s.paragraph}>
            Kimlik doğrulama ve veri saklama için Supabase altyapısı kullanılmaktadır. Kur ve piyasa verileri için harici servislerden faydalanılabilir.
          </Text>

          <Text style={s.sectionTitle}>Veri dışa aktarma</Text>
          <Text style={s.paragraph}>
            Profil ekranındaki “Veriyi Dışa Aktar” seçeneği ile verilerinizin bir özetini dışa aktarabilirsiniz.
          </Text>

          <Text style={s.sectionTitle}>İletişim</Text>
          <Text style={s.paragraph}>
            Destek talepleriniz için profil ekranındaki “Destek” bölümünü kullanabilirsiniz.
          </Text>
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
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm, gap: Spacing.sm },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.navy700, marginTop: Spacing.sm },
  paragraph: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22, color: Colors.textSecondary },
});
