
import apiClient from '@/lib/apiClient';

export const getAvailableTimeSlots = async (professionalId, serviceId, selectedDate) => {
  try {
    // Phase 5: Business logic moved to Laravel.
    // The frontend no longer manually calculates slots based on schedules & previous appointments.
    return await apiClient.availability.get(professionalId, serviceId, selectedDate);
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    throw error;
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
