const API_URL = '222133-production.up.railway.app';

// ======================================================
// MOCK MODE — включи true чтобы тестировать без сервера
// ======================================================
const USE_MOCK = true;

const mockDelay = () => new Promise(res => setTimeout(res, 800));

const mockDatabase: Record<string, any> = {};

async function mockPost(endpoint: string, data: any): Promise<any> {
  await mockDelay();

  if (endpoint === '/auth/register') {
    const { username, email, password, displayName } = data;
    if (mockDatabase[username]) {
      throw new Error('Пользователь с таким именем уже существует');
    }
    mockDatabase[username] = { username, email, password, displayName };
    return { token: `mock-token-${username}-${Date.now()}`, user: { username, displayName, email } };
  }

  if (endpoint === '/auth/login') {
    const { username, password } = data;
    const user = mockDatabase[username];
    if (!user || user.password !== password) {
      throw new Error('Неверное имя пользователя или пароль');
    }
    return { token: `mock-token-${username}-${Date.now()}`, user };
  }

  throw new Error('Mock: endpoint не найден');
}

export class ApiService {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  static async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  static async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data: any) {
    if (USE_MOCK) {
      return mockPost(endpoint, data);
    }
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  static async uploadFile(endpoint: string, file: File, onProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_URL}${endpoint}`);
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      xhr.send(formData);
    });
  }
}
