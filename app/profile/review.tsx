import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ReviewFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { client } = useAuth();
  const { addReview, operating } = useProfile(client?.id);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const appointmentId = params.appointmentId as string;
  const barberId = params.barberId as string;
  const serviceName = params.serviceName as string;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Atenção', 'Selecione uma avaliação');
      return;
    }

    const { error } = await addReview({
      appointmentId,
      barberId,
      rating,
      comment: comment.trim(),
    });

    if (error) {
      Alert.alert('Erro', error);
    } else {
      Alert.alert('Sucesso!', 'Avaliação enviada. Você ganhou 10 pontos!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Avaliar Serviço</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.serviceInfo}>
            <Ionicons name="cut" size={32} color={colors.primary} />
            <Text style={styles.serviceName}>{serviceName}</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Como foi o serviço?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={48}
                    color={colors.gold}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Deixe um comentário (opcional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Conte como foi sua experiência..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="gift" size={20} color={colors.success} />
            <Text style={styles.infoText}>
              Você ganhará 10 pontos de fidelidade ao enviar esta avaliação!
            </Text>
          </View>

          <Button
            title="Enviar Avaliação"
            onPress={handleSubmit}
            loading={operating}
            disabled={rating === 0}
          />
        </View>
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
  content: {
    padding: spacing.lg,
  },
  serviceInfo: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  serviceName: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentSection: {
    marginBottom: spacing.lg,
  },
  commentInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 120,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
