import { getSupabaseClient } from '@/template';

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  phone: string;
  barbershopId: string;
}

export async function createUserAdmin(params: CreateUserParams) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: params,
  });

  if (error) {
    console.error('Create user error:', error);
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
