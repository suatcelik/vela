import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Polyline, Circle, Rect } from 'react-native-svg';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { useSettingsStore } from '../../stores/useSettingsStore';

// ─── SVG Icons ───────────────────────────────────────────
function HomeIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M12 2.1L1 12h3v9h6v-6h4v6h6v-9h3L12 2.1z" fill={color} />
      ) : (
        <>
          <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
            stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 21V12h6v9"
            stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function WalletIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M21 7H3a1 1 0 0 0-1 1v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-1-2zm-1 7h-2a1.5 1.5 0 0 1 0-3h2v3zM3 5h15a1 1 0 0 1 1 1H3V5z"
          fill={color} />
      ) : (
        <>
          <Rect x={2} y={5} width={20} height={14} rx={2}
            stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M2 9h20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx={17} cy={14} r={1} fill={color} />
        </>
      )}
    </Svg>
  );
}

function ChartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Path d="M21.7 5.3a1 1 0 0 0-1.4 0L13.5 12 9 7.5a1 1 0 0 0-1.4 0L1 14.1V17h2l6-6.4 4.5 4.5a1 1 0 0 0 1.4 0L23 7.4V5l-1.3.3z"
            fill={color} />
          <Rect x={1} y={19} width={22} height={2} rx={1} fill={color} />
        </>
      ) : (
        <>
          <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17"
            stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points="16 7 22 7 22 13"
            stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function SavingsIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M11.8 2C6.28 2 1.8 6.5 1.8 12s4.48 10 10 10 10-4.48 10-10S17.32 2 11.8 2zm.2 3c.55 0 1 .45 1 1v5.59l3.71 3.71c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0l-4-4A1 1 0 0 1 11 12V6c0-.55.45-1 1-1z"
          fill={color} />
      ) : (
        <>
          <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
          <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function PersonIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Circle cx={12} cy={8} r={4} fill={color} />
          <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={color} />
        </>
      ) : (
        <>
          <Circle cx={12} cy={8} r={4}
            stroke={color} strokeWidth={1.8} />
          <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
            stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// ─── Custom Tab Bar Icon ──────────────────────────────────
function TabIcon({
  focused,
  icon: Icon,
  label,
}: {
  focused: boolean;
  icon: React.FC<{ filled: boolean; color: string }>;
  label: string;
}) {
  const color = focused ? Colors.navy700 : Colors.textMuted;
  return (
    <View style={tabStyles.item}>
      {focused && <View style={tabStyles.pill} />}
      <Icon filled={focused} color={color} />
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
    position: 'relative',
    minWidth: 56,
  },
  pill: {
    position: 'absolute',
    top: -2,
    width: 42,
    height: 28,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(26,64,128,0.08)',
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: Colors.navy700,
    fontFamily: Fonts.bold,
  },
});

// ─── Layout ───────────────────────────────────────────────
export default function TabsLayout() {
  const { darkMode } = useSettingsStore();

  const tabBarBackground = darkMode ? '#101b2d' : Colors.white;
  const tabBarBorder = darkMode ? '#22314a' : Colors.border;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 4,
          elevation: 8,
          shadowColor: Colors.navy950,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.07,
          shadowRadius: 16,
        },
        tabBarShowLabel: false, // we render label inside TabIcon
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={HomeIcon} label="Ana Sayfa" />
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={WalletIcon} label="Borç" />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ChartIcon} label="Portföy" />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={SavingsIcon} label="Bütçe" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={PersonIcon} label="Profil" />
          ),
        }}
      />
    </Tabs>
  );
}
