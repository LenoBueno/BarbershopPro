import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service: { name: string; price: number } | null;
  barber: { name: string } | null;
}

export default function HomeScreen() {
  const { client, refreshClient } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (client) {
      loadAppointments();
    }
  }, [client]);

  const loadAppointments = async () => {
    if (!client) return;

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, price),
          barber:barbers(name)
        `)
        .eq('client_id', client.id)
        .in('status', ['confirmado', 'em_atendimento'])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(3);

      if (!error && data) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Load appointments error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshClient();
    await loadAppointments();
    setRefreshing(false);
  };

  const getTierColor = () => {
    switch (client?.loyalty_tier) {
      case 'ouro':
        return colors.gold;
      case 'prata':
        return colors.silver;
      default:
        return colors.bronze;
    }
  };

  const getTierProgress = () => {
    const points = client?.loyalty_points || 0;
    if (points >= 500) return 100;
    if (points >= 200) return ((points - 200) / 300) * 100;
    return (points / 200) * 100;
  };

  const getNextTierInfo = () => {
    const points = client?.loyalty_points || 0;
    if (points >= 500) return { tier: 'Ouro', remaining: 0 };
    if (points >= 200) return { tier: 'Ouro', remaining: 500 - points };
    return { tier: 'Prata', remaining: 200 - points };
  };

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const nextTier = getNextTierInfo();

  return (
    <Screen scroll>
      <View style={styles.container}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {client?.name}!</Text>
          <Text style={styles.subGreeting}>Bem-vindo de volta</Text>
        </View>

        <View style={[styles.loyaltyCard, { borderLeftColor: getTierColor() }]}>
          <View style={styles.loyaltyHeader}>
            <View>
              <Text style={styles.loyaltyTier}>{client?.loyalty_tier?.toUpperCase()}</Text>
              <Text style={styles.loyaltyPoints}>{client?.loyalty_points} pontos</Text>
            </View>
            <Ionicons name="trophy" size={32} color={getTierColor()} />
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getTierProgress()}%`, backgroundColor: getTierColor() }]} />
          </View>
          
          {nextTier.remaining > 0 && (
            <Text style={styles.nextTierText}>
              Faltam {nextTier.remaining} pontos para {nextTier.tier}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
          
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Nenhum agendamento</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push('/(tabs)/booking')}
              >
                <Text style={styles.bookButtonText}>Agendar Agora</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentDate}>
                    <Text style={styles.appointmentDay}>{formatDate(item.appointment_date)}</Text>
                    <Text style={styles.appointmentTime}>{formatTime(item.appointment_time)}</Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentService}>{item.service?.name}</Text>
                    <Text style={styles.appointmentBarber}>
                      <Ionicons name="person" size={12} color={colors.textSecondary} /> {item.barber?.name}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, item.status === 'em_atendimento' && styles.statusActive]}>
                    <Text style={styles.statusText}>
                      {item.status === 'em_atendimento' ? 'Em atendimento' : 'Confirmado'}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Agendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Produtos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="gift-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Indicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loyaltyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loyaltyTier: {
    ...typography.h3,
    color: colors.text,
  },
  loyaltyPoints: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  nextTierText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    ...typography.button,
    color: colors.background,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  appointmentDate: {
    width: 60,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  appointmentDay: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  appointmentTime: {
    ...typography.h3,
    color: colors.text,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentService: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  appointmentBarber: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.xs,
  },
});
