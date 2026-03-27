import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

function Placeholder({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Faz 2'de geliyor</Text>
      </View>
    </View>
  );
}

export function DebtsScreen() {
  return <Placeholder emoji="💸" title="Borç / Alacak" desc="Kişi bazlı borç ve alacaklarını takip et." />;
}

export function PortfolioScreen() {
  return <Placeholder emoji="📈" title="Portföy" desc="Altın, döviz ve kripto varlıklarını tek ekranda gör." />;
}

export function BudgetScreen() {
  return <Placeholder emoji="💰" title="Bütçe" desc="Aylık gelir-gider takibi ve kategori limitleri." />;
}

export function ProfileScreen() {
  return <Placeholder emoji="👤" title="Profil" desc="Hesap ayarları ve tercihler." />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emoji: { fontSize: 56 },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  desc: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  badge: {
    marginTop: 8,
    backgroundColor: Colors.navy100,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.navy600,
  },
});
