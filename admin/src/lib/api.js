const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401) {
        try {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.replace('/login')
          }
        } catch {
          /* ignore */
        }
      }
      const error = await response.json().catch(() => ({}))
      const err = new Error(error.message || error.error || `Lỗi ${response.status}`)
      err.status = response.status
      err.payload = error
      throw err
    }

    if (response.status === 204) return null
    return response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError' || (err.name === 'TypeError' && err.message.includes('fetch'))) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra mạng hoặc đảm bảo API đang chạy.')
    }
    throw err
  }
}

export const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== '' && v !== null && v !== undefined) acc[k] = v
        return acc
      }, {})
    ).toString()
    const data = await apiCall(`/products${queryString ? `?${queryString}` : ''}`)
    // Backend trả về { items, page, totalPages, totalItems }
    return {
      items: data.items || [],
      page: data.page || 1,
      totalPages: data.totalPages || 1,
      totalItems: data.totalItems || (data.items ? data.items.length : 0),
    }
  },
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products/${id}`, { method: 'DELETE' }),
}

export const ordersAPI = {
  getAll: () => apiCall('/orders/all'),
  getById: (id) => apiCall(`/orders/${id}`),
  updateStatus: (id, status, tracking_number) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_number }),
    }),
}

export const usersAPI = {
  getAll: () => apiCall('/users/all'),
  getById: (id) => apiCall(`/users/${id}`),
  update: (id, data) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}