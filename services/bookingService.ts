import { getSupabaseClient } from '@/template';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  photo_url: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export async function getServices() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Get services error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getBarbers() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Get barbers error:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getAvailableTimeSlots(
  barberId: string,
  date: string
): Promise<{ data: TimeSlot[] | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    
    // Get existing appointments for this barber on this date
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_time, service:services(duration_minutes)')
      .eq('barber_id', barberId)
      .eq('appointment_date', date)
      .in('status', ['confirmado', 'em_atendimento']);

    if (error) {
      console.error('Get appointments error:', error);
      return { data: null, error: error.message };
    }

    // Generate time slots from 9:00 to 18:00 (every 30 minutes)
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot is available
        const isBooked = appointments?.some((apt: any) => {
          const aptTime = apt.appointment_time.substring(0, 5);
          return aptTime === time;
        });

        slots.push({
          time,
          available: !isBooked,
        });
      }
    }

    return { data: slots, error: null };
  } catch (error: any) {
    console.error('Get time slots exception:', error);
    return { data: null, error: error.message };
  }
}

export async function createAppointment(params: {
  clientId: string;
  barbershopId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
}) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: params.clientId,
        barbershop_id: params.barbershopId,
        barber_id: params.barberId,
        service_id: params.serviceId,
        appointment_date: params.date,
        appointment_time: params.time,
        status: 'confirmado',
      })
      .select()
      .single();

    if (error) {
      console.error('Create appointment error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Create appointment exception:', error);
    return { data: null, error: error.message };
  }
}
