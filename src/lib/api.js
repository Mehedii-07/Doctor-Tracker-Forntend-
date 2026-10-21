const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('doctor_tracker_token');
  }
  return null;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('doctor_tracker_token');
      localStorage.removeItem('doctor_tracker_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const errorMsg = data.message || (data.errors ? data.errors.join(', ') : 'API request failed');
    throw new Error(errorMsg);
  }

  return data;
};

// API Services
export const authApi = {
  login: (credentials) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiFetch('/auth/me'),
};

export const doctorApi = {
  getDoctors: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiFetch(`/doctors?${query.toString()}`);
  },
  getDoctor: (id) => apiFetch(`/doctors/${id}`),
  createDoctor: (data) =>
    apiFetch('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDoctor: (id, data) =>
    apiFetch(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDoctor: (id) =>
    apiFetch(`/doctors/${id}`, {
      method: 'DELETE',
    }),
  getDoctorPatients: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/doctors/${id}/patients${query ? `?${query}` : ''}`);
  },
  addPatientToDoctor: (id, patientData) =>
    apiFetch(`/doctors/${id}/patients`, {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),
  deletePatientFromDoctor: (id, patientId) =>
    apiFetch(`/doctors/${id}/patients/${patientId}`, {
      method: 'DELETE',
    }),
};

export const patientApi = {
  getPatients: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiFetch(`/patients?${query.toString()}`);
  },
  getPatient: (id) => apiFetch(`/patients/${id}`),
  createPatient: (data) =>
    apiFetch('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePatient: (id, data) =>
    apiFetch(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePatient: (id) =>
    apiFetch(`/patients/${id}`, {
      method: 'DELETE',
    }),
};

export const dashboardApi = {
  getStats: () => apiFetch('/dashboard/stats'),
};
