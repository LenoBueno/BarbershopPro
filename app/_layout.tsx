import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/appointments" />
          <Stack.Screen name="profile/reviews" />
          <Stack.Screen name="profile/review" />
          <Stack.Screen name="profile/referrals" />
          <Stack.Screen name="profile/settings" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
