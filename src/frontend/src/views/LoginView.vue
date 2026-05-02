<template>
  <div class="max-w-md mx-auto mt-16">
    <div class="bg-white rounded-xl shadow-sm border border-warm-200 p-8">
      <h1 class="text-2xl font-bold text-warm-900 mb-2 text-center">
        {{ isRegistering ? 'Criar Conta' : 'Entrar' }}
      </h1>
      <p class="text-sm text-warm-500 text-center mb-6">
        {{ isRegistering ? 'Registe-se para gerir contactos' : 'Inicie sessão para gerir contactos' }}
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-warm-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-2 border border-warm-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder="O seu username"
            required
            autocomplete="username"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-warm-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-2 border border-warm-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder="••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ isRegistering ? 'Registar' : 'Entrar' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          type="button"
          @click="toggleMode"
          class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          {{ isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Registar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const isRegistering = ref(false);
const submitting = ref(false);
const error = ref('');

function toggleMode() {
  isRegistering.value = !isRegistering.value;
  error.value = '';
}

async function handleSubmit() {
  error.value = '';
  submitting.value = true;

  try {
    if (isRegistering.value) {
      await auth.register(username.value, password.value);
    } else {
      await auth.login(username.value, password.value);
    }
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Ocorreu um erro. Tente novamente.';
  } finally {
    submitting.value = false;
  }
}
</script>
