import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function LoadingState() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
