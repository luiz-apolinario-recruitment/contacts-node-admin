import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { readApiError } from '../utils/apiError.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        user.value = data.user || data;
        return true;
      }
      user.value = null;
      return false;
    } catch {
      user.value = null;
      return false;
    }
  }

  async function login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Login falhou. Verifique as credenciais.'));
    }
    const data = await res.json();
    user.value = data.user;
    return data;
  }

  async function register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, 'Registo falhou. Tente outro username.'));
    }
    const data = await res.json();
    user.value = data.user;
    return data;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    user.value = null;
  }

  return { user, isAuthenticated, checkAuth, login, register, logout };
});
