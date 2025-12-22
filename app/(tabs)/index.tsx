import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ============================================
// TYPES
// ============================================

interface UpcomingAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service: { name: string; price: number } | null;
  barber: { name: string } | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTierProgress(points: number): number {
  if (points >= 500) return 100;
  if (points >= 200) return ((points - 200) / 300) * 100;
  return (points / 200) * 100;
}

function getNextTierInfo(points: number): { tier: string; remaining: number } {
  if (points >= 500) return { tier: 'Ouro', remaining: 0 };
  if (points >= 200) return { tier: 'Ouro', remaining: 500 - points };
  return { tier: 'Prata', remaining: 200 - points };
}

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatTime(time: string): string {
  return time.substring(0, 5);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmado: 'Confirmado',
    em_atendimento: 'Em Atendimento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
}

// ============================================
// COMPONENTS
// ============================================

function WelcomeHeader({ name }: { name: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Olá, {name}!</Text>
      <Text style={styles.subGreeting}>Bem-vindo de volta</Text>
    </View>
  );
}

function LoyaltyCard({ 
  tier, 
  points, 
  tierColor 
}: { 
  tier: string; 
  points: number; 
  tierColor: string;
}) {
  const progress = getTierProgress(points);
  const nextTier = getNextTierInfo(points);

  return (
    <View style={[styles.loyaltyCard, { borderLeftColor: tierColor }]}>
      <View style={styles.loyaltyHeader}>
        <View>
          <Text style={styles.loyaltyTier}>{tier.toUpperCase()}</Text>
          <Text style={styles.loyaltyPoints}>{points} pontos</Text>
        </View>
        <Ionicons name="trophy" size={32} color={tierColor} />
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%`, backgroundColor: tierColor }
          ]} 
        />
      </View>
      
      {nextTier.remaining > 0 && (
        <Text style={styles.nextTierText}>
          Faltam {nextTier.remaining} pontos para {nextTier.tier}
        </Text>
      )}
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: UpcomingAppointment }) {
  const isActive = appointment.status === 'em_atendimento';

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentDate}>
        <Text style={styles.appointmentDay}>{formatDate(appointment.appointment_date)}</Text>
        <Text style={styles.appointmentTime}>{formatTime(appointment.appointment_time)}</Text>
      </View>
      
      <View style={styles.appointmentDetails}>
        <Text style={styles.appointmentService}>{appointment.service?.name}</Text>
        <View style={styles.appointmentBarberRow}>
          <Ionicons name="person" size={12} color={colors.textSecondary} />
          <Text style={styles.appointmentBarber}>{appointment.barber?.name}</Text>
        </View>
      </View>
      
      <View style={[styles.statusBadge, isActive && styles.statusActive]}>
        <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
      </View>
    </View>
  );
}

function EmptyAppointments({ onBook }: { onBook: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
      <Text style={styles.emptyText}>Nenhum agendamento</Text>
      <TouchableOpacity style={styles.bookButton} onPress={onBook}>
        <Text style={styles.bookButtonText}>Agendar Agora</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions({ router }: { router: any }) {
  const actions = [
    { icon: 'calendar-outline', label: 'Agendar', route: '/(tabs)/booking' },
    { icon: 'cart-outline', label: 'Produtos', route: '/(tabs)/orders' },
    { icon: 'people-outline', label: 'Indicar', route: '/profile/referrals' },
  ];

  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.actionCard}
          onPress={() => router.push(action.route)}
        >
          <Ionicons name={action.icon as any} size={24} color={colors.primary} />
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function HomeScreen() {
  const router = useRouter();
  const { client, refreshClient } = useAuth();
  const { colors, tierColor } = useTheme();
  const { appointments, loadAppointments } = useProfile(client?.id);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (client) {
      loadAppointments();
    }
  }, [client]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshClient(),
      loadAppointments(),
    ]);
    setRefreshing(false);
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmado' || a.status === 'em_atendimento')
    .slice(0, 3);

  const styles = createStyles(colors);
  
  if (!client) {
    return <Screen><View /></Screen>;
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        
        <WelcomeHeader name={client.name} />

        <LoyaltyCard 
          tier={client.loyalty_tier}
          points={client.loyalty_points}
          tierColor={tierColor}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
          
          {upcomingAppointments.length === 0 ? (
            <EmptyAppointments onBook={() => router.push('/(tabs)/booking')} />
          ) : (
            <FlatList
              data={upcomingAppointments}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <AppointmentCard appointment={item} />}
            />
          )}
        </View>

        <QuickActions router={router} />
      </View>
    </Screen>
  );
}

// ============================================
// STYLES
// ============================================

function createStyles(colors: any) {
  return StyleSheet.create({
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
    ...shadows.sm,
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
  appointmentBarberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  appointmentBarber: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
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
}
