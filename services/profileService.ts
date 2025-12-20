import { getSupabaseClient } from '@/template';

export interface AppointmentDetail {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  qr_code: string | null;
  service: {
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
  barber: {
    name: string;
    photo_url: string | null;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  appointment: {
    appointment_date: string;
    service: { name: string } | null;
    barber: { name: string } | null;
  } | null;
}

export interface Referral {
  id: string;
  referred_phone: string;
  status: string;
  points_awarded: number;
  created_at: string;
  confirmed_at: string | null;
}

// ============================================
// APPOINTMENTS
// ============================================

export async function getMyAppointments(clientId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, price, duration_minutes),
        barber:barbers(name, photo_url),
        review:reviews(id, rating, comment)
      `)
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) {
      console.error('Get appointments error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as AppointmentDetail[], error: null };
  } catch (error: any) {
    console.error('Get appointments exception:', error);
    return { data: null, error: error.message };
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelado' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('Cancel appointment error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Cancel appointment exception:', error);
    return { data: null, error: error.message };
  }
}

export async function updateAppointment(params: {
  appointmentId: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
}) {
  try {
    const supabase = getSupabaseClient();
    const updates: any = {};
    
    if (params.barberId) updates.barber_id = params.barberId;
    if (params.serviceId) updates.service_id = params.serviceId;
    if (params.date) updates.appointment_date = params.date;
    if (params.time) updates.appointment_time = params.time;

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', params.appointmentId)
      .select()
      .single();

    if (error) {
      console.error('Update appointment error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Update appointment exception:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// REVIEWS
// ============================================

export async function getMyReviews(clientId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        appointment:appointments(
          appointment_date,
          service:services(name),
          barber:barbers(name)
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get reviews error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Review[], error: null };
  } catch (error: any) {
    console.error('Get reviews exception:', error);
    return { data: null, error: error.message };
  }
}

export async function createReview(params: {
  appointmentId: string;
  clientId: string;
  barberId: string;
  rating: number;
  comment: string;
}) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        appointment_id: params.appointmentId,
        client_id: params.clientId,
        barber_id: params.barberId,
        rating: params.rating,
        comment: params.comment,
      })
      .select()
      .single();

    if (error) {
      console.error('Create review error:', error);
      return { data: null, error: error.message };
    }

    // Award points for review (example: 10 points)
    await supabase
      .from('clients')
      .update({ 
        loyalty_points: supabase.raw('loyalty_points + 10')
      })
      .eq('id', params.clientId);

    return { data, error: null };
  } catch (error: any) {
    console.error('Create review exception:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// REFERRALS
// ============================================

export async function getMyReferrals(clientId: string) {
  try {
    const supabase = getSupabaseClient();
    
    // First get the client to find referrer_id
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (!client) {
      return { data: null, error: 'Cliente não encontrado' };
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get referrals error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Referral[], error: null };
  } catch (error: any) {
    console.error('Get referrals exception:', error);
    return { data: null, error: error.message };
  }
}

export async function createReferral(params: {
  clientId: string;
  phone: string;
}) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if phone already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', params.clientId)
      .eq('referred_phone', params.phone)
      .single();

    if (existing) {
      return { data: null, error: 'Este telefone já foi indicado' };
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: params.clientId,
        referred_phone: params.phone,
        status: 'pendente',
        points_awarded: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create referral error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Create referral exception:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// PROFILE
// ============================================

export async function updateProfile(params: {
  clientId: string;
  name?: string;
  phone?: string;
  email?: string;
}) {
  try {
    const supabase = getSupabaseClient();
    const updates: any = {};
    
    if (params.name) updates.name = params.name;
    if (params.phone) updates.phone = params.phone;
    if (params.email) updates.email = params.email;

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', params.clientId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Update profile exception:', error);
    return { data: null, error: error.message };
  }
}
