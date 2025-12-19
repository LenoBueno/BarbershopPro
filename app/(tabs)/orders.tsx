import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing, typography } from '@/constants/theme';

export default function OrdersScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Meus Pedidos</Text>
        <Text style={styles.subtitle}>Em desenvolvimento...</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
