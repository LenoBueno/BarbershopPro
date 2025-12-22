import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Step = 'service' | 'datetime' | 'confirm';

export default function BookingScreen() {
  const router = useRouter();
  const { client } = useAuth();
  const { colors } = useTheme();
  const {
    services,
    barbers,
    timeSlots,
    loading,
    creating,
    loadServices,
    loadBarbers,
    loadTimeSlots,
    bookAppointment,
  } = useBooking();

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    loadServices();
    loadBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      loadTimeSlots(selectedBarber.id, dateStr);
    }
  }, [selectedBarber, selectedDate]);

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  const handleNext = () => {
    if (step === 'service') {
      if (!selectedService || !selectedBarber) {
        Alert.alert('Atenção', 'Selecione um serviço e um barbeiro');
        return;
      }
      setStep('datetime');
    } else if (step === 'datetime') {
      if (!selectedTime) {
        Alert.alert('Atenção', 'Selecione um horário');
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('service');
    } else if (step === 'confirm') {
      setStep('datetime');
    }
  };

  const handleConfirm = async () => {
    if (!client) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data, error } = await bookAppointment({
      clientId: client.id,
      barbershopId: client.barbershop_id,
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      date: dateStr,
      time: selectedTime,
    });

    if (error) {
      Alert.alert('Erro', error);
    } else {
      Alert.alert(
        'Sucesso!',
        'Agendamento confirmado com sucesso',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    }
  };

  const styles = createStyles(colors);

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Agendar Horário</Text>
          
          {/* Progress Steps */}
          <View style={styles.steps}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step !== 'service' && styles.stepCircleActive]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Serviço</Text>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step === 'confirm' && styles.stepCircleActive]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Horário</Text>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step === 'confirm' && styles.stepCircleActive]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Confirmar</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step 1: Service & Barber */}
          {step === 'service' && (
            <>
              <Text style={styles.sectionTitle}>Escolha o serviço</Text>
              <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.serviceCard,
                      selectedService?.id === item.id && styles.serviceCardActive,
                    ]}
                    onPress={() => setSelectedService(item)}
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{item.name}</Text>
                      <Text style={styles.serviceDescription}>{item.description}</Text>
                      <Text style={styles.serviceDuration}>{item.duration_minutes} min</Text>
                    </View>
                    <Text style={styles.servicePrice}>R$ {item.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                )}
              />

              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
                Escolha o barbeiro
              </Text>
              <FlatList
                data={barbers}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.barberCard,
                      selectedBarber?.id === item.id && styles.barberCardActive,
                    ]}
                    onPress={() => setSelectedBarber(item)}
                  >
                    <View style={styles.barberAvatar}>
                      <Ionicons name="person" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.barberInfo}>
                      <Text style={styles.barberName}>{item.name}</Text>
                      <Text style={styles.barberSpecialty}>{item.specialty}</Text>
                    </View>
                    <View style={styles.barberRating}>
                      <Ionicons name="star" size={14} color={colors.gold} />
                      <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && (
            <>
              <Text style={styles.sectionTitle}>Escolha a data</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.datesContainer}
              >
                {getNext7Days().map((date, index) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateCard, isSelected && styles.dateCardActive]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.weekday, isSelected && styles.weekdayActive]}>
                        {formatWeekday(date)}
                      </Text>
                      <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                        {formatDate(date)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
                Escolha o horário
              </Text>
              {loading ? (
                <Text style={styles.loadingText}>Carregando horários...</Text>
              ) : (
                <View style={styles.timeSlotsGrid}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        !slot.available && styles.timeSlotUnavailable,
                        selectedTime === slot.time && styles.timeSlotActive,
                      ]}
                      onPress={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          !slot.available && styles.timeSlotTextUnavailable,
                          selectedTime === slot.time && styles.timeSlotTextActive,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <View style={styles.confirmationContainer}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmRow}>
                  <Ionicons name="cut" size={20} color={colors.primary} />
                  <View style={styles.confirmInfo}>
                    <Text style={styles.confirmLabel}>Serviço</Text>
                    <Text style={styles.confirmValue}>{selectedService?.name}</Text>
                  </View>
                </View>

                <View style={styles.confirmRow}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                  <View style={styles.confirmInfo}>
                    <Text style={styles.confirmLabel}>Barbeiro</Text>
                    <Text style={styles.confirmValue}>{selectedBarber?.name}</Text>
                  </View>
                </View>

                <View style={styles.confirmRow}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <View style={styles.confirmInfo}>
                    <Text style={styles.confirmLabel}>Data</Text>
                    <Text style={styles.confirmValue}>
                      {selectedDate.toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.confirmRow}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <View style={styles.confirmInfo}>
                    <Text style={styles.confirmLabel}>Horário</Text>
                    <Text style={styles.confirmValue}>{selectedTime}</Text>
                  </View>
                </View>

                <View style={[styles.confirmRow, styles.confirmTotal]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    R$ {selectedService?.price.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={styles.infoText}>
                  Você pode cancelar até 24h antes do horário agendado
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {step !== 'service' && (
            <Button
              title="Voltar"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          
          {step !== 'confirm' ? (
            <Button
              title="Próximo"
              onPress={handleNext}
              style={styles.nextButton}
            />
          ) : (
            <Button
              title="Confirmar Agendamento"
              onPress={handleConfirm}
              loading={creating}
              style={styles.nextButton}
            />
          )}
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
      padding: spacing.lg,
      backgroundColor: colors.surface,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    steps: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepItem: {
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    stepCircleActive: {
      backgroundColor: colors.primary,
    },
    stepNumber: {
      ...typography.bodySmall,
      color: colors.text,
    },
    stepLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.surfaceLight,
      marginHorizontal: spacing.sm,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
    },
    serviceCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    serviceCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    serviceInfo: {
      flex: 1,
    },
    serviceName: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    serviceDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    serviceDuration: {
      ...typography.caption,
      color: colors.primary,
      marginTop: spacing.xs,
    },
    servicePrice: {
      ...typography.h3,
      color: colors.primary,
    },
    barberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    barberCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    barberAvatar: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    barberInfo: {
      flex: 1,
    },
    barberName: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    barberSpecialty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    barberRating: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    ratingText: {
      ...typography.bodySmall,
      color: colors.text,
      marginLeft: spacing.xs,
    },
    datesContainer: {
      marginBottom: spacing.lg,
    },
    dateCard: {
      width: 80,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginRight: spacing.sm,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    dateCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    weekday: {
      ...typography.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    weekdayActive: {
      color: colors.primary,
    },
    dateText: {
      ...typography.body,
      color: colors.text,
      marginTop: spacing.xs,
    },
    dateTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      padding: spacing.lg,
    },
    timeSlotsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.xs,
    },
    timeSlot: {
      width: '22%',
      margin: '1.5%',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    timeSlotActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceLight,
    },
    timeSlotUnavailable: {
      opacity: 0.3,
    },
    timeSlotText: {
      ...typography.bodySmall,
      color: colors.text,
    },
    timeSlotTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    timeSlotTextUnavailable: {
      color: colors.textTertiary,
    },
    confirmationContainer: {
      flex: 1,
    },
    confirmCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    confirmRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    confirmInfo: {
      marginLeft: spacing.md,
      flex: 1,
    },
    confirmLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    confirmValue: {
      ...typography.body,
      color: colors.text,
      marginTop: spacing.xs,
    },
    confirmTotal: {
      borderBottomWidth: 0,
      paddingTop: spacing.lg,
      justifyContent: 'space-between',
    },
    totalLabel: {
      ...typography.h3,
      color: colors.text,
    },
    totalValue: {
      ...typography.h2,
      color: colors.primary,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: colors.info + '20',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    infoText: {
      ...typography.bodySmall,
      color: colors.text,
      marginLeft: spacing.sm,
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    backButton: {
      flex: 1,
      marginRight: spacing.sm,
    },
    nextButton: {
      flex: 2,
    },
  });
}
