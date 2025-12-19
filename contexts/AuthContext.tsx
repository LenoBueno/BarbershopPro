import { createContext, ReactNode, useState, useEffect } from 'react';
import { getSupabaseClient } from '@/template';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

export interface Client {
  id: string;
  user_id: string;
  barbershop_id: string;
  name: string;
  phone: string;
  email: string | null;
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'prata' | 'ouro';
}

export interface AuthContextType {
  user: AuthUser | null;
  client: Client | null;
  loading: boolean;
  operationLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone: string, barbershopId: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshClient: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'barbershop_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      
      console.log('Session data:', data);
      if (error) console.error('Session error:', error);
      
      if (data.session) {
        const authUser: AuthUser = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          username: data.session.user.user_metadata?.username,
        };
        setUser(authUser);
        await loadClient(authUser.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClient = async (userId: string) => {
    try {
      console.log('Loading client for userId:', userId);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Client data:', data);
      if (error) console.error('Client error:', error);

      if (!error && data) {
        setClient(data);
      }
    } catch (error) {
      console.error('Load client error:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setOperationLoading(true);
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('=== LOGIN RESPONSE ===');
      console.log('Success:', !!data.user);
      console.log('Error:', error?.message);

      if (error) {
        console.error('❌ Login failed:', error.message);
        return { error: `Credenciais inválidas. Erro: ${error.message}` };
      }

      if (!data.user) {
        return { error: 'Falha ao autenticar usuário' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata?.username,
      };
      
      console.log('✅ User authenticated:', authUser.email);
      setUser(authUser);
      
      console.log('Loading client data...');
      await loadClient(authUser.id);
      
      console.log('✅ LOGIN SUCCESSFUL!');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Sign in exception:', error);
      return { error: `Erro ao fazer login: ${error.message || 'Desconhecido'}` };
    } finally {
      setOperationLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    barbershopId: string
  ): Promise<{ error: string | null }> => {
    setOperationLoading(true);
    try {
      console.log('Attempting sign up for:', email);
      const supabase = getSupabaseClient();
      
      // Use Edge Function to create user with auto-confirmed email
      const { data: createData, error: createError } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          name,
          phone,
          barbershopId,
        },
      });

      console.log('User creation response:', { createData, createError });

      if (createError) {
        console.error('Create user error:', createError);
        return { error: createError.message || 'Erro ao criar conta' };
      }

      if (!createData?.success) {
        return { error: createData?.error || 'Falha ao criar usuário' };
      }

      // Now sign in with the newly created user
      console.log('Signing in after registration...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auto sign in error:', authError);
        return { error: 'Conta criada, mas erro ao fazer login. Tente fazer login manualmente.' };
      }

      if (authData.user) {
        const authUser: AuthUser = {
          id: authData.user.id,
          email: authData.user.email || '',
          username: name,
        };
        setUser(authUser);
        await loadClient(authUser.id);
      }

      console.log('Sign up and auto-login successful!');
      return { error: null };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { error: 'Erro ao criar conta' };
    } finally {
      setOperationLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
      setClient(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshClient = async () => {
    if (user) {
      await loadClient(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    client,
    loading,
    operationLoading,
    signIn,
    signUp,
    signOut,
    refreshClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
