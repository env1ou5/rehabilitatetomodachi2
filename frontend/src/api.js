const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'rehab_tomo_token';

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear:    () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, requiresAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, requiresAuth: false }),
  login:    (payload) => request('/auth/login',    { method: 'POST', body: payload, requiresAuth: false }),

  getPet:        ()      => request('/pet'),
  renamePet:     (name)  => request('/pet', { method: 'PATCH', body: { name } }),
  updatePet:      (patch) => request('/pet', { method: 'PATCH', body: patch }),
  logHardDay:    (note)  => request('/pet/hard-day', { method: 'POST', body: { note } }),

  getQuests:        ()    => request('/quests'),
  completeQuest:    (id)  => request(`/quests/${id}/complete`, { method: 'POST' }),
  uncompleteQuest:  (id)  => request(`/quests/${id}/complete`, { method: 'DELETE' }),

  getJournal:       ()         => request('/journal'),
  addJournal:       (entry)    => request('/journal', { method: 'POST', body: entry }),
  deleteJournal:    (id)       => request(`/journal/${id}`, { method: 'DELETE' }),

  chat: (message, history) => request('/chat', { method: 'POST', body: { message, history } }),
};
