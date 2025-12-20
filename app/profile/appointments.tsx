import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentDetail } from '@/services/profileService';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { client } = useAuth();
  const { appointments, operating, cancelAppointmentById } = useProfile(client?.id);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return colors.success;
      case 'em_atendimento':
        return colors.info;
      case 'concluido':
        return colors.primary;
      case 'cancelado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'em_atendimento':
        return 'Em Atendimento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const canCancel = (appointment: AppointmentDetail) => {
    if (appointment.status !== 'confirmado') return false;
    
    // Check if appointment is more than 24h away
    const appointmentDateTime = new Date(
      appointment.appointment_date + 'T' + appointment.appointment_time
    );
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntil > 24;
  };

  const handleCancel = (appointment: AppointmentDetail) => {
    if (!canCancel(appointment)) {
      Alert.alert(
        'Não é possível cancelar',
        'O cancelamento só pode ser feito com pelo menos 24 horas de antecedência.'
      );
      return;
    }

    Alert.alert(
      'Cancelar Agendamento',
      'Deseja realmente cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            const { error } = await cancelAppointmentById(appointment.id);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert('Sucesso', 'Agendamento cancelado');
            }
          },
        },
      ]
    );
  };

  const handleShowQR = (appointment: AppointmentDetail) => {
    if (appointment.status !== 'confirmado') {
      Alert.alert('Atenção', 'QR Code disponível apenas para agendamentos confirmados');
      return;
    }
    setSelectedAppointment(appointment);
    setQrModalVisible(true);
  };

  const renderAppointment = ({ item }: { item: AppointmentDetail }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentDate}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.dateText}>{formatDate(item.appointment_date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{formatTime(item.appointment_time)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cut" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.service?.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.barber?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash" size={16} color={colors.textSecondary} />
          <Text style={styles.priceText}>R$ {item.service?.price.toFixed(2)}</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observações:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      <View style={styles.appointmentActions}>
        {item.status === 'confirmado' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShowQR(item)}
            >
              <Ionicons name="qr-code" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !canCancel(item) && styles.actionButtonDisabled]}
              onPress={() => handleCancel(item)}
              disabled={!canCancel(item)}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={canCancel(item) ? colors.error : colors.disabled}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: canCancel(item) ? colors.error : colors.disabled },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'concluido' && !item.review && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/profile/review',
              params: {
                appointmentId: item.id,
                barberId: item.barber?.id || '',
                serviceName: item.service?.name || '',
              }
            })}
          >
            <Ionicons name="star" size={18} color={colors.gold} />
            <Text style={styles.actionButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'em_atendimento'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'concluido' || a.status === 'cancelado'
  );

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Meus Agendamentos</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={[...upcomingAppointments, ...pastAppointments]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={renderAppointment}
          ListEmptyComponent={
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
          }
        />

        {/* QR Code Modal */}
        <Modal
          visible={qrModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>QR Code do Agendamento</Text>
                <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrContainer}>
                <Ionicons name="qr-code" size={200} color={colors.primary} />
                <Text style={styles.qrInfo}>
                  Apresente este código na barbearia
                </Text>
              </View>

              <Button
                title="Fechar"
                onPress={() => setQrModalVisible(false)}
                variant="outline"
              />
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    padding: spacing.lg,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appointmentDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '600',
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
  appointmentInfo: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  priceText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  notesContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  qrInfo: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
