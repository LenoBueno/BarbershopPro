import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { client, refreshClient } = useAuth();
  const { editProfile, operating } = useProfile(client?.id);

  const [name, setName] = useState(client?.name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite seu nome');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Atenção', 'Digite seu telefone');
      return;
    }

    const { error } = await editProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || client?.email,
    });

    if (error) {
      Alert.alert('Erro', error);
    } else {
      await refreshClient();
      Alert.alert('Sucesso!', 'Perfil atualizado', [
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
          <Text style={styles.title}>Configurações</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.primary} />
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button
              title="Salvar Alterações"
              onPress={handleSave}
              loading={operating}
              style={styles.saveButton}
            />
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.sectionTitle}>Zona de Perigo</Text>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert(
                  'Excluir Conta',
                  'Esta ação é irreversível. Deseja realmente excluir sua conta?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: () => {
                        // Implement account deletion
                        Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve');
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
              <Text style={styles.dangerButtonText}>Excluir Conta</Text>
            </TouchableOpacity>
          </View>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dangerButtonText: {
    ...typography.body,
    color: colors.error,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});
