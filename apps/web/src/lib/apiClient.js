const API_BASE = import.meta.env.VITE_API_URL || '/api';

let authToken = localStorage.getItem('admin_token');
let clientToken = localStorage.getItem('client_token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
};

const getHeaders = (isClient = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  const token = isClient ? clientToken : authToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return await res.json();
    },
    logout: async () => {
      const res = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Logout failed');
      return await res.json();
    },
    getUser: async () => {
      const res = await fetch(`${API_BASE}/user`, {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error('Unauthorized');
      return await res.json();
    }
  },
  clientAuth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/client/login`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      clientToken = data.token;
      localStorage.setItem('client_token', data.token);
      return data;
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/client/register`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }
      const data = await res.json();
      clientToken = data.token;
      localStorage.setItem('client_token', data.token);
      return data;
    },
    googleLogin: async (googleData) => {
      const res = await fetch(`${API_BASE}/client/google-login`, {
        method: 'POST',
        headers: getHeaders(false), // don't send token out
        body: JSON.stringify(googleData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Google Auth failed');
      }
      const data = await res.json();
      clientToken = data.token;
      localStorage.setItem('client_token', data.token);
      return data;
    },
    logout: async () => {
      if (clientToken) {
        await fetch(`${API_BASE}/client/logout`, {
          method: 'POST',
          headers: getHeaders(true)
        }).catch(() => {});
      }
      clientToken = null;
      localStorage.removeItem('client_token');
    },
    getUser: async () => {
      const res = await fetch(`${API_BASE}/client/user`, {
        headers: getHeaders(true)
      });
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      return json.data;
    },
    getAppointments: async () => {
      const res = await fetch(`${API_BASE}/client/appointments`, {
        headers: getHeaders(true)
      });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    cancelAppointment: async (id) => {
      const res = await fetch(`${API_BASE}/client/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: getHeaders(true)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to cancel appointment');
      }
      return await res.json();
    }
  },
  professionals: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/professionals`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/professionals`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/professionals/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/professionals/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
    }
  },
  services: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/services`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    getOne: async (id) => {
      const res = await fetch(`${API_BASE}/services/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/services`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/services/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
    }
  },
  appointments: {
    getAll: async () => {
      // Admin gets all sorted via backend
      const res = await fetch(`${API_BASE}/appointments`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    getByProfessionalAndDateRange: async (professionalId, startDate) => {
      const res = await fetch(`${API_BASE}/appointments?professional_id=${professionalId}&date=${startDate}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('API Error: ' + await res.text());
      const json = await res.json();
      return json.data;
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
    },
    sendReminder: async (id) => {
      const res = await fetch(`${API_BASE}/appointments/${id}/send-reminder`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send reminder');
      }
      const json = await res.json();
      return json.data;
    }
  },
  schedules: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/schedules`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    getByProfessional: async (professionalId) => {
      const res = await fetch(`${API_BASE}/schedules?professional_id=${professionalId}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    getByProfessionalAndDay: async (professionalId, dayName) => {
      const res = await fetch(`${API_BASE}/schedules?professional_id=${professionalId}&day_of_week=${dayName}&is_enabled=1`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/schedules`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
    }
  },
  availability: {
    get: async (professionalId, serviceId, date) => {
      const res = await fetch(`${API_BASE}/availability?professional_id=${professionalId}&service_id=${serviceId}&date=${date}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data;
    }
  }
};

export default apiClient;
