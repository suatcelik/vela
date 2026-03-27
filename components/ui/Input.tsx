import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  secureToggle?: boolean; // show eye icon for password fields
}

export function Input({
  label,
  error,
  hint,
  rightIcon,
  leftIcon,
  secureToggle,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputRow,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure}
          autoCapitalize="none"
          {...props}
        />

        {secureToggle ? (
          <TouchableOpacity
            onPress={() => setSecure((v) => !v)}
            style={styles.iconRight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeIcon}>{secure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },

  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
  },

  focused: {
    borderColor: Colors.navy400,
    backgroundColor: Colors.white,
  },

  errored: {
    borderColor: Colors.red500,
  },

  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    height: '100%',
  },

  inputWithLeft: { marginLeft: Spacing.sm },

  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },

  eyeIcon: { fontSize: 16 },

  error: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.red500,
  },

  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
