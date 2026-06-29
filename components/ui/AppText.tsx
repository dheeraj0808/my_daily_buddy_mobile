import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { palette, typography } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'caption' | 'label';

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    fontSize: typography.size.xxl,
    fontFamily: typography.fontFamily.extrabold,
    color: palette.text,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: typography.size.xl,
    fontFamily: typography.fontFamily.extrabold,
    color: palette.text,
  },
  h2: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.bold,
    color: palette.text,
  },
  title: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.semibold,
    color: palette.text,
  },
  body: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.regular,
    color: palette.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.regular,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.semibold,
    color: palette.textSecondary,
  },
};

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
}

export default function AppText({ variant = 'body', color, style, children, ...rest }: Props) {
  return (
    <Text style={[variantStyles[variant], color ? { color } : null, style]} {...rest}>
      {children}
    </Text>
  );
}
