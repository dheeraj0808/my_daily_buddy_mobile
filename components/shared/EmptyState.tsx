import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ emoji = '📭', title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 32, gap: 8 },
  emoji: { fontSize: 40, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
});
