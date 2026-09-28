const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiUrl(path = '') {
  const base = API_URL.replace(/\/$/, '');
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${base}${route}`;
}

export async function apiFetch(path, options = {}) {
  const { auth = true, headers = {}, body, ...rest } = options;

  const finalHeaders = { ...headers };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  if (body && !(body instanceof FormData) && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(getApiUrl(path), {
    ...rest,
    headers: finalHeaders,
    body: body instanceof FormData || typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined,
  });

  return response;
}

export { API_URL };
