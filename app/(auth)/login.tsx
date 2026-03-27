import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/useAuthStore';

export default function LoginScreen() {
  const { signIn, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    // E-postadaki boşlukları temizleyip küçük harfe çeviriyoruz
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    setError(null);
    const { error: err } = await signIn(sanitizedEmail, password);
    if (err) setError(err);
    // on success, _layout.tsx will redirect to (tabs)
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
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⚓</Text>
            </View>
            <Text style={styles.appName}>
              Ve<Text style={styles.appNameAccent}>la</Text>
            </Text>
            <Text style={styles.tagline}>Finansını yönet. Geleceğini kur.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Giriş Yap</Text>
            <Text style={styles.cardSub}>Hesabına hoş geldin.</Text>

            <View style={styles.form}>
              <Input
                label="E-posta"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={error && !email ? 'Gerekli' : undefined}
              />
              <Input
                label="Şifre"
                placeholder="••••••••"
                secureTextEntry
                secureToggle
                value={password}
                onChangeText={setPassword}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              )}

              <Button
                label="Giriş Yap"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
              />

              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgot}>Şifremi unuttum</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Kayıt ol</Text>
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
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.xxl },
  logoWrap: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  logoBox: { width: 64, height: 64, borderRadius: Radius.xl, backgroundColor: 'rgba(26,64,128,0.6)', borderWidth: 1, borderColor: 'rgba(0,200,150,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  logoEmoji: { fontSize: 28 },
  appName: { fontFamily: Fonts.extraBold, fontSize: 36, color: Colors.white, letterSpacing: -1 },
  appNameAccent: { color: Colors.green400 },
  tagline: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.45)' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: Spacing.xxl, gap: Spacing.sm },
  cardTitle: { fontFamily: Fonts.extraBold, fontSize: 24, color: Colors.textPrimary, letterSpacing: -0.5 },
  cardSub: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.md },
  form: { gap: Spacing.lg },
  errorBox: { backgroundColor: Colors.red100, borderRadius: Radius.md, padding: Spacing.md },
  errorText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.red500 },
  forgotWrap: { alignItems: 'center' },
  forgot: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.navy600 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  registerLink: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.green400 },
});