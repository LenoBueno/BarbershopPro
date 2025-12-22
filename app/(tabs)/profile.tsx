import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// COMPONENTS
// ============================================

function ProfileHeader({ 
  name, 
  email, 
  phone, 
  tierColor 
}: { 
  name: string; 
  email: string | null; 
  phone: string; 
  tierColor: string;
}) {
  return (
    <View style={styles.header}>
      <View style={[styles.avatar, { borderColor: tierColor }]}>
        <Ionicons name="person" size={48} color={tierColor} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.phone}>{phone}</Text>
    </View>
  );
}

function LoyaltyStats({
  points,
  tier,
  tierColor,
}: {
  points: number;
  tier: string;
  tierColor: string;
}) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.stat}>
        <Text style={[styles.statValue, { color: tierColor }]}>{points}</Text>
        <Text style={styles.statLabel}>Pontos</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.statValue, { color: tierColor }]}>{tier.toUpperCase()}</Text>
        <Text style={styles.statLabel}>Nível</Text>
      </View>
    </View>
  );
}

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  onPress?: () => void;
}

function MenuList({ 
  items, 
  router 
}: { 
  items: MenuItem[]; 
  router: any;
}) {
  return (
    <View style={styles.menu}>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.menuItem}
          onPress={item.route ? () => router.push(item.route) : item.onPress}
        >
          <Ionicons name={item.icon as any} size={24} color={colors.textSecondary} />
          <Text style={styles.menuText}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function ProfileScreen() {
  const { client, signOut } = useAuth();
  const { colors, tierColor } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'calendar-outline',
      label: 'Meus Agendamentos',
      route: '/profile/appointments',
    },
    {
      icon: 'star-outline',
      label: 'Avaliações',
      route: '/profile/reviews',
    },
    {
      icon: 'people-outline',
      label: 'Indicar Amigos',
      route: '/profile/referrals',
    },
    {
      icon: 'gift-outline',
      label: 'Vale Presente',
      onPress: () => Alert.alert('Em breve', 'Vale Presente estará disponível em breve'),
    },
    {
      icon: 'settings-outline',
      label: 'Configurações',
      route: '/profile/settings',
    },
  ];

  const styles = createStyles(colors);
  
  if (!client) {
    return <Screen><View /></Screen>;
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <ProfileHeader
          name={client.name}
          email={client.email}
          phone={client.phone}
          tierColor={tierColor}
        />

        <LoyaltyStats
          points={client.loyalty_points}
          tier={client.loyalty_tier}
          tierColor={tierColor}
        />

        <MenuList items={menuItems} router={router} />

        <Button
          title="Sair"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  phone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});
}
