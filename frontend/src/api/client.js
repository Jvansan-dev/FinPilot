const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const isAuthEndpoint = path.startsWith('/auth/');
    if (res.status === 401 && !isAuthEndpoint) {
      // Sessão expirada ou token inválido: limpa a sessão e manda para o login
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    throw new Error(data?.error || `Erro na requisição (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, senha) => request('/auth/login', { method: 'POST', body: { email, senha } }),
  register: (nome, email, senha) => request('/auth/register', { method: 'POST', body: { nome, email, senha } }),

  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', { method: 'POST', body: data }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: data }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (data) => request('/transactions', { method: 'POST', body: data }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: data }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  getBudgets: () => request('/budgets'),
  upsertBudget: (data) => request('/budgets', { method: 'POST', body: data }),
};
