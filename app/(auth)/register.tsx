import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

export default function RegisterScreen() {
  const { signUp, loading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    const { error: err } = await signUp(email, password, fullName);
    if (err) {
      setError(err);
    } else {
      // Supabase sends confirmation email — notify user
      router.replace('/(auth)/login');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.navy950, Colors.navy900, '#062a20']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⚓</Text>
            </View>
            <Text style={styles.appName}>
              Ve<Text style={styles.appNameAccent}>la</Text>
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hesap Oluştur</Text>
            <Text style={styles.cardSub}>Finansal özgürlüğe ilk adım.</Text>

            <View style={styles.form}>
              <Input
                label="Ad Soyad"
                placeholder="Ahmet Yılmaz"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <Input
                label="E-posta"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Şifre"
                placeholder="En az 6 karakter"
                secureTextEntry
                secureToggle
                value={password}
                onChangeText={setPassword}
              />
              <Input
                label="Şifre Tekrar"
                placeholder="Şifreni tekrar gir"
                secureTextEntry
                secureToggle
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              )}

              <Button
                label="Kayıt Ol"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
              />

              <Text style={styles.terms}>
                Kayıt olarak{' '}
                <Text style={styles.termsLink}>Gizlilik Politikası</Text>
                'nı kabul etmiş olursunuz.
              </Text>
            </View>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.xl,
  },

  back: { alignSelf: 'flex-start' },
  backText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },

  logoWrap: { alignItems: 'center', gap: Spacing.sm },

  logoBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(26,64,128,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoEmoji: { fontSize: 24 },

  appName: {
    fontFamily: Fonts.extraBold,
    fontSize: 28,
    color: Colors.white,
    letterSpacing: -1,
  },

  appNameAccent: { color: Colors.green400 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
  },

  cardTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  cardSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },

  form: { gap: Spacing.lg },

  errorBox: {
    backgroundColor: Colors.red100,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },

  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.red500,
  },

  terms: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  termsLink: { color: Colors.navy600 },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  loginText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },

  loginLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.green400,
  },
});
