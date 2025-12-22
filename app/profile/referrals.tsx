import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Referral } from '@/services/profileService';

export default function ReferralsScreen() {
  const router = useRouter();
  const { client } = useAuth();
  const { colors } = useTheme();
  const { referrals, addReferral, operating } = useProfile(client?.id);
  const [phone, setPhone] = useState('');

  const handleAddReferral = async () => {
    if (!phone.trim()) {
      Alert.alert('Atenção', 'Digite o telefone do amigo');
      return;
    }

    const { error } = await addReferral(phone.trim());
    if (error) {
      Alert.alert('Erro', error);
    } else {
      Alert.alert('Sucesso!', 'Indicação registrada! Você ganhará 50 pontos quando seu amigo fizer a primeira visita.');
      setPhone('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return colors.success;
      case 'pendente':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const confirmedCount = referrals.filter((r) => r.status === 'confirmado').length;
  const totalPoints = referrals.reduce((sum, r) => sum + r.points_awarded, 0);

  const styles = createStyles(colors);
  
  const renderReferral = ({ item }: { item: Referral }) => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View>
          <Text style={styles.phone}>{item.referred_phone}</Text>
          <Text style={styles.date}>Indicado em {formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {item.status === 'confirmado' && item.confirmed_at && (
        <View style={styles.confirmedInfo}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.confirmedText}>
            Confirmado em {formatDate(item.confirmed_at)} • +{item.points_awarded} pontos
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Indicar Amigos</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{confirmedCount}</Text>
              <Text style={styles.statLabel}>Amigos Indicados</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Pontos Ganhos</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Indicar Novo Amigo</Text>
            <Text style={styles.formSubtitle}>
              Ganhe 50 pontos quando seu amigo fizer a primeira visita!
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Telefone do amigo"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Button
              title="Indicar Amigo"
              onPress={handleAddReferral}
              loading={operating}
            />
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Histórico de Indicações</Text>
          </View>

          <FlatList
            data={referrals}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={renderReferral}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Nenhuma indicação ainda</Text>
                <Text style={styles.emptySubtext}>
                  Comece a indicar amigos e ganhe pontos!
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Screen>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.h3,
    color: colors.text,
  },
  referralCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phone: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  confirmedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmedText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
}
