import { useState, useEffect } from 'react';
import {
  getServices,
  getBarbers,
  getAvailableTimeSlots,
  createAppointment,
  Service,
  Barber,
  TimeSlot,
} from '@/services/bookingService';

export function useBooking() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    const { data, error } = await getServices();
    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const loadBarbers = async () => {
    setLoading(true);
    const { data, error } = await getBarbers();
    if (!error && data) {
      setBarbers(data);
    }
    setLoading(false);
  };

  const loadTimeSlots = async (barberId: string, date: string) => {
    setLoading(true);
    const { data, error } = await getAvailableTimeSlots(barberId, date);
    if (!error && data) {
      setTimeSlots(data);
    }
    setLoading(false);
  };

  const bookAppointment = async (params: {
    clientId: string;
    barbershopId: string;
    barberId: string;
    serviceId: string;
    date: string;
    time: string;
  }) => {
    setCreating(true);
    const result = await createAppointment(params);
    setCreating(false);
    return result;
  };

  return {
    services,
    barbers,
    timeSlots,
    loading,
    creating,
    loadServices,
    loadBarbers,
    loadTimeSlots,
    bookAppointment,
  };
}
