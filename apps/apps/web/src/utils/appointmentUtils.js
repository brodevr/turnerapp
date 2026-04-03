
import apiClient from '@/lib/apiClient';

export const getAvailableTimeSlots = async (professionalId, serviceId, selectedDate) => {
  try {
    const data = await apiClient.availability.get(professionalId, serviceId, selectedDate);
    // API now returns { available: [...], all_slots: [...] }
    // Return available array for booking validation / backwards compatibility
    return Array.isArray(data) ? data : (data.available ?? []);
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    throw error;
  }
};

export const getAllSlotsWithStatus = async (professionalId, serviceId, selectedDate) => {
  try {
    const data = await apiClient.availability.get(professionalId, serviceId, selectedDate);
    return Array.isArray(data) ? data.map(t => ({ time: t, available: true })) : (data.all_slots ?? []);
  } catch (error) {
    console.error('Error fetching all time slots:', error);
    throw error;
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};
