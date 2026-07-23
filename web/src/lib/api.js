const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Base URL for static files (uploads, images). Falls back to API origin by stripping /api.
export const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE)
  || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5001');

export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${ASSET_BASE}${path}`;
  return `${ASSET_BASE}/${path}`;
}

const API_TIMEOUT = 10000; // 10 seconds timeout

// Helper function for API calls with timeout
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Tự động logout khi token hết hạn/không hợp lệ, tránh UI "đăng nhập ảo" vĩnh viễn
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Phát sự kiện để AuthContext có thể đồng bộ nếu đang lắng nghe
          window.dispatchEvent(new CustomEvent('luxe:auth-expired'));
        } catch { /* ignore */ }
      }

      const error = await response.json().catch(() => ({}));
      throw Object.assign(new Error(error.error || error.message || 'API request failed'), {
        status: response.status,
        endpoint
      });
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    // Create user-friendly error
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Server không phản hồi. Vui lòng kiểm tra kết nối.'), {
        isNetworkError: true
      });
    }
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw Object.assign(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'), {
        isNetworkError: true
      });
    }
    throw err;
  }
}

// Check if API is available
export async function checkAPIHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_URL}/products?limit=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Auth API
export const authAPI = {
  login: (identifier, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  requestOTP: (identifier, method = 'email') =>
    apiCall('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    }),
  
  verifyOTP: (otpId, code) =>
    apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otpId, code }),
    }),

  setPassword: (password) =>
    apiCall('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  checkAuthMethod: (identifier, method) =>
    apiCall('/auth/check-auth-method', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Lưu ý: KHÔNG xóa localStorage ở đây — gọi useAuth().logout() để đồng bộ React state.
  // Hàm này giữ để tương thích ngược nhưng thực chất là no-op.
  logout: () => {},
};

// Users API
export const usersAPI = {
  // getProfile/updateProfile đã được loại bỏ — backend không có route /users/profile,
  // dùng usersAPI.update(currentUser.id, data) thay thế.

  update: (id, userData) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/users/${id}/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    });
  },
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getList: (page = 1, limit = 12, filters = {}) => {
    const params = { page, limit, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products?${queryString}`);
  },

  getById: (id) => apiCall(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (orderData) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: (userId) => apiCall(`/orders/user/${userId}`),
  // Alias for backwards compatibility
  getAll: function () {
    const userStr = localStorage.getItem('user');
    if (!userStr) return Promise.resolve([]);
    try {
      const user = JSON.parse(userStr);
      if (!user?.id) return Promise.resolve([]);
      return apiCall(`/orders/user/${user.id}`);
    } catch {
      return Promise.resolve([]);
    }
  },

  getById: (id) => apiCall(`/orders/${id}`),

  cancel: (id) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    }),

  // User tự hủy đơn của mình (an toàn hơn `cancel` ở trên — có verify quyền sở hữu
  // và chỉ cho phép khi đơn ở trạng thái cho phép).
  cancelByUser: (id) =>
    apiCall(`/orders/${id}/cancel`, {
      method: 'POST',
    }),
};

// Addresses API (saved addresses per user)
export const addressesAPI = {
  list: (userId) => apiCall(`/users/${userId}/addresses`),
  create: (userId, data) =>
    apiCall(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (userId, id, data) =>
    apiCall(`/users/${userId}/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (userId, id) =>
    apiCall(`/users/${userId}/addresses/${id}`, {
      method: 'DELETE',
    }),
  setDefault: (userId, id) =>
    apiCall(`/users/${userId}/addresses/${id}/default`, {
      method: 'PUT',
    }),
};

// Measurements API
export const measurementsAPI = {
  get: (userId) => apiCall(`/users/${userId}/measurements`),
  save: (userId, data) =>
    apiCall(`/users/${userId}/measurements`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Stats API for account sidebar (order counts per status)
export const statsAPI = {
  getUserStats: (userId) => apiCall(`/users/${userId}/stats`),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId) => apiCall(`/reviews/product/${productId}`),
  create: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // FormData for multipart/form-data
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create review');
      }
      return res.json();
    });
  },
  markHelpful: (id) => apiCall(`/reviews/${id}/helpful`, { method: 'POST' }),
  delete: (id) => apiCall(`/reviews/${id}`, { method: 'DELETE' }),
};

// Wishlist API
export const wishlistAPI = {
  list: () => apiCall('/wishlist'),
  add: (productId) => apiCall('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  }),
  remove: (productId) => apiCall(`/wishlist/${productId}`, {
    method: 'DELETE',
  }),
  check: (productId) => apiCall(`/wishlist/check/${productId}`),
};

// Payment API (VietQR + Sepay webhook)
export const paymentAPI = {
  getBanks: () => apiCall('/payment/banks'),
  getQR: (orderId, bankId) => apiCall(`/payment/qr?orderId=${orderId}&bankId=${bankId}`),
  markPaid: (orderId) => apiCall(`/payment/orders/${orderId}/mark-paid`, {
    method: 'POST',
  }),
};
