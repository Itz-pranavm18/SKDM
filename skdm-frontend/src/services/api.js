const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Token helpers
export const getToken = () => localStorage.getItem('skm_access_token');
export const getRefreshToken = () => localStorage.getItem('skm_refresh_token');
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('skm_access_token', accessToken);
  if (refreshToken) localStorage.setItem('skm_refresh_token', refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem('skm_access_token');
  localStorage.removeItem('skm_refresh_token');
  localStorage.removeItem('skm_user');
};
export const getUser = () => {
  const user = localStorage.getItem('skm_user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => {
  localStorage.setItem('skm_user', JSON.stringify(user));
};

// Base HTTP request wrapper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && getRefreshToken()) {
        // Attempt automatic refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry original request
          headers.Authorization = `Bearer ${getToken()}`;
          const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
          return await retryRes.json();
        }
      }
      const errorMessage = (data?.errors && Array.isArray(data.errors) && data.errors.length > 0)
        ? data.errors.join(' • ')
        : (data?.message || 'An error occurred');
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/auth/refresh-token?refreshToken=${refreshToken}`, {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok && data?.data?.accessToken) {
      setTokens(data.data.accessToken, null);
      return true;
    }
  } catch (e) {
    clearTokens();
  }
  clearTokens();
  return false;
}

// ── API Services ──────────────────────────────────────────────────────────────

export const authApi = {
  login: async (usernameOrEmail, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    if (res?.data?.accessToken) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    }
    return res;
  },

  signup: (data) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  logout: async () => {
    try {
      const refreshToken = getRefreshToken();
      await apiRequest(`/auth/logout?refreshToken=${refreshToken || ''}`, { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (data) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  changePassword: (data) => apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
};

export const coursesApi = {
  getAll: () => apiRequest('/courses'),
  getById: (id) => apiRequest(`/courses/${id}`),
};

export const facultyApi = {
  getAll: () => apiRequest('/faculty'),
};

export const noticesApi = {
  getAll: () => apiRequest('/notices'),
};

export const galleryApi = {
  getAll: (tag) => apiRequest(`/gallery${tag ? `?tag=${tag}` : ''}`),
};

export const testimonialsApi = {
  getAll: () => apiRequest('/testimonials'),
};

export const contactApi = {
  submit: (data) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

export const admissionsApi = {
  apply: (data) => apiRequest('/admissions', { method: 'POST', body: JSON.stringify(data) }),
  getMyAdmissions: () => apiRequest('/admissions/my'),
};

export const adminApi = {
  getDashboard: () => apiRequest('/admin/dashboard'),

  // Users
  getUsers: (page = 0, search = '', size = 10) =>
    apiRequest(`/admin/users?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  suspendUser: (id, reason) =>
    apiRequest(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  activateUser: (id) => apiRequest(`/admin/users/${id}/activate`, { method: 'PATCH' }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  resetUserPassword: (id, newPassword) =>
    apiRequest(`/admin/users/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
  assignUserRole: (id, role) =>
    apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  // Admissions
  getAdmissions: (status = '', search = '', page = 0, size = 10) =>
    apiRequest(`/admin/admissions?page=${page}&size=${size}${status ? `&status=${status}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  approveAdmission: (id, remarks) =>
    apiRequest(`/admin/admissions/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ remarks }) }),
  rejectAdmission: (id, reason) =>
    apiRequest(`/admin/admissions/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),

  // Notices
  getNotices: (search = '', tag = '', page = 0, size = 10) =>
    apiRequest(`/admin/notices?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}${tag ? `&tag=${tag}` : ''}`),
  createNotice: (data) => apiRequest('/admin/notices', { method: 'POST', body: JSON.stringify(data) }),
  updateNotice: (id, data) => apiRequest(`/admin/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNotice: (id) => apiRequest(`/admin/notices/${id}`, { method: 'DELETE' }),

  // Courses
  getCourses: (search = '', page = 0, size = 10) =>
    apiRequest(`/admin/courses?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  createCourse: (data) => apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => apiRequest(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id) => apiRequest(`/admin/courses/${id}`, { method: 'DELETE' }),

  // Faculty
  getFaculty: (search = '', page = 0, size = 10) =>
    apiRequest(`/admin/faculty?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  createFaculty: (data) => apiRequest('/admin/faculty', { method: 'POST', body: JSON.stringify(data) }),
  updateFaculty: (id, data) => apiRequest(`/admin/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaculty: (id) => apiRequest(`/admin/faculty/${id}`, { method: 'DELETE' }),

  // Gallery
  getGallery: () => apiRequest('/gallery'),
  createGalleryItem: (data) => apiRequest('/admin/gallery', { method: 'POST', body: JSON.stringify(data) }),
  deleteGalleryItem: (id) => apiRequest(`/admin/gallery/${id}`, { method: 'DELETE' }),

  // New Admissions & Fees
  createAdmission: (data) => apiRequest('/admin/admissions/create', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (userId, data) => apiRequest(`/admin/students/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (userId) => apiRequest(`/admin/students/${userId}`, { method: 'DELETE' }),
  getPendingFeeVerifications: () => apiRequest('/admin/fee-verifications'),
  verifyFeePayment: (id) => apiRequest(`/admin/fee-verifications/${id}/verify`, { method: 'PATCH' }),
  rejectFeePayment: (id, reason) => apiRequest(`/admin/fee-verifications/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getFeeCollectionSummary: () => apiRequest('/admin/fee-collection'),

  // Fee Structure Management & Filtered Students
  getFeeStructures: () => apiRequest('/admin/fee-structures'),
  updateFeeStructure: (id, data) => apiRequest(`/admin/fee-structures/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getStudentsFiltered: (course = 'BA', semester = 'Semester 1') =>
    apiRequest(`/admin/students-filtered?course=${encodeURIComponent(course)}&semester=${encodeURIComponent(semester)}`),
  promoteStudent: (userId) => apiRequest(`/admin/students/${userId}/promote`, { method: 'POST' }),

  // Contact Messages
  getContactMessages: (status = '', page = 0, size = 10) =>
    apiRequest(`/admin/contact-messages?page=${page}&size=${size}${status ? `&status=${status}` : ''}`),
  markContactMessageRead: (id) =>
    apiRequest(`/admin/contact-messages/${id}/mark-read`, { method: 'PATCH' }),
  deleteContactMessage: (id) =>
    apiRequest(`/admin/contact-messages/${id}`, { method: 'DELETE' }),
  replyContactMessage: (id, reply) =>
    apiRequest(`/admin/contact-messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),

  // Activity Logs
  getActivityLogs: (page = 0, size = 20) => apiRequest(`/admin/activity-logs?page=${page}&size=${size}`),
};

export const studentFeeApi = {
  getFeeDashboard: () => apiRequest('/student/fee-dashboard'),
  payFee: (data) => apiRequest('/student/pay-fee', { method: 'POST', body: JSON.stringify(data) }),
  getReceipt: (id) => apiRequest(`/student/receipts/${id}`),
  getFeeDetails: () => apiRequest('/student/fee-details'),
  submitPaymentRequest: (data) => apiRequest('/student/payment-requests', { method: 'POST', body: JSON.stringify(data) }),
};

export const uploadApi = {
  uploadImage: async (file, type = 'general') => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${BASE_URL}/upload/admin/image?type=${encodeURIComponent(type)}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to upload image file');
    }
    return data;
  },
};
