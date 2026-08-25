const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'baafiye_token';
const USER_KEY = 'baafiye_user';

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function extractErrorMessage(data, fallback = 'Waxbaa qaldamay. Fadlan mar kale isku day.') {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return fallback;
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body == null ? undefined : isForm ? body : JSON.stringify(body),
  });

  let data = null;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth && onUnauthorized) {
      onUnauthorized();
    }

    const error = new Error(extractErrorMessage(data, 'Request failed'));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function createListingClient(basePath) {
  return {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
      const qs = query.toString();
      return request(`${basePath}${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`${basePath}/${id}`),
    create: (payload) => request(basePath, { method: 'POST', body: payload, auth: true }),
    update: (id, payload) =>
      request(`${basePath}/${id}`, { method: 'PUT', body: payload, auth: true }),
    delete: (id) => request(`${basePath}/${id}`, { method: 'DELETE', auth: true }),
    markReturned: (id) =>
      request(`${basePath}/${id}/returned`, { method: 'PATCH', auth: true }),
    myItems: () => request(`${basePath}/my-items`, { auth: true }),
    getMatches: (id) => request(`${basePath}/${id}/matches`),
  };
}

export function listingApi(kind = 'found') {
  return kind === 'lost' ? api.lostItems : api.items;
}

export const api = {
  health: () => request('/health'),

  auth: {
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
    verify: (payload) => request('/auth/verify', { method: 'POST', body: payload }),
    resendVerification: (payload) =>
      request('/auth/resend-verification', { method: 'POST', body: payload }),
    forgotPassword: (payload) =>
      request('/auth/forgot-password', { method: 'POST', body: payload }),
    resetPassword: (payload) =>
      request('/auth/reset-password', { method: 'POST', body: payload }),
  },

  categories: {
    list: () => request('/categories'),
    create: (payload) => request('/categories', { method: 'POST', body: payload, auth: true }),
    update: (id, payload) =>
      request(`/categories/${id}`, { method: 'PUT', body: payload, auth: true }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE', auth: true }),
  },

  items: createListingClient('/items'),
  lostItems: createListingClient('/lost-items'),

  contact: {
    send: (payload) => request('/contact', { method: 'POST', body: payload }),
  },

  chats: {
    list: () => request('/chats', { auth: true }),
    start: (payload) => request('/chats', { method: 'POST', body: payload, auth: true }),
    getById: (id) => request(`/chats/${id}`, { auth: true }),
    sendMessage: (id, text) =>
      request(`/chats/${id}/messages`, { method: 'POST', body: { text }, auth: true }),
  },

  notifications: {
    list: () => request('/notifications', { auth: true }),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH', auth: true }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH', auth: true }),
  },
};
