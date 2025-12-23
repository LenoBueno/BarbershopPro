import { useAuth } from './useAuth';
import { getTierColor, getTierLightColor, getTierGradient, colors } from '@/constants/theme';

export function useTheme() {
  const { client } = useAuth();
  const tier = client?.loyalty_tier || 'bronze';

  return {
    tier,
    tierColor: getTierColor(tier),
    tierLightColor: getTierLightColor(tier),
    tierGradient: getTierGradient(tier),
    colors,
  };
}
