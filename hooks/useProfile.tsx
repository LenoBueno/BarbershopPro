import { useState, useEffect } from 'react';
import {
  getMyAppointments,
  getMyReviews,
  getMyReferrals,
  cancelAppointment,
  updateAppointment,
  createReview,
  createReferral,
  updateProfile,
  AppointmentDetail,
  Review,
  Referral,
} from '@/services/profileService';

export function useProfile(clientId?: string) {
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [operating, setOperating] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadAll();
    }
  }, [clientId]);

  const loadAll = async () => {
    if (!clientId) return;
    setLoading(true);
    await Promise.all([
      loadAppointments(),
      loadReviews(),
      loadReferrals(),
    ]);
    setLoading(false);
  };

  const loadAppointments = async () => {
    if (!clientId) return;
    const { data, error } = await getMyAppointments(clientId);
    if (!error && data) {
      setAppointments(data);
    }
  };

  const loadReviews = async () => {
    if (!clientId) return;
    const { data, error } = await getMyReviews(clientId);
    if (!error && data) {
      setReviews(data);
    }
  };

  const loadReferrals = async () => {
    if (!clientId) return;
    const { data, error } = await getMyReferrals(clientId);
    if (!error && data) {
      setReferrals(data);
    }
  };

  const cancelAppointmentById = async (appointmentId: string) => {
    setOperating(true);
    const result = await cancelAppointment(appointmentId);
    setOperating(false);
    if (!result.error) {
      await loadAppointments();
    }
    return result;
  };

  const updateAppointmentById = async (params: {
    appointmentId: string;
    barberId?: string;
    serviceId?: string;
    date?: string;
    time?: string;
  }) => {
    setOperating(true);
    const result = await updateAppointment(params);
    setOperating(false);
    if (!result.error) {
      await loadAppointments();
    }
    return result;
  };

  const addReview = async (params: {
    appointmentId: string;
    barberId: string;
    rating: number;
    comment: string;
  }) => {
    if (!clientId) return { data: null, error: 'Cliente não encontrado' };
    
    setOperating(true);
    const result = await createReview({
      ...params,
      clientId,
    });
    setOperating(false);
    
    if (!result.error) {
      await loadReviews();
      await loadAppointments();
    }
    return result;
  };

  const addReferral = async (phone: string) => {
    if (!clientId) return { data: null, error: 'Cliente não encontrado' };
    
    setOperating(true);
    const result = await createReferral({
      clientId,
      phone,
    });
    setOperating(false);
    
    if (!result.error) {
      await loadReferrals();
    }
    return result;
  };

  const editProfile = async (params: {
    name?: string;
    phone?: string;
    email?: string;
  }) => {
    if (!clientId) return { data: null, error: 'Cliente não encontrado' };
    
    setOperating(true);
    const result = await updateProfile({
      clientId,
      ...params,
    });
    setOperating(false);
    
    return result;
  };

  return {
    appointments,
    reviews,
    referrals,
    loading,
    operating,
    loadAppointments,
    loadReviews,
    loadReferrals,
    cancelAppointmentById,
    updateAppointmentById,
    addReview,
    addReferral,
    editProfile,
  };
}
