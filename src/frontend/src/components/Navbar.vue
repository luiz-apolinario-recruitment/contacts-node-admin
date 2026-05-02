<template>
  <nav class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-warm-200 shadow-sm">
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="font-bold text-warm-900 text-lg tracking-tight">ContactsApp</span>
        </RouterLink>

        <!-- Nav links -->
        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="text-warm-600 hover:text-warm-900 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-warm-100"
            :class="{ 'text-primary-700 bg-primary-50': $route.path === '/' }"
          >
            Início
          </RouterLink>

          <RouterLink
            v-if="auth.isAuthenticated"
            to="/contacts/add"
            class="hidden sm:flex items-center gap-1.5 text-warm-600 hover:text-warm-900 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-warm-100"
            :class="{ 'text-primary-700 bg-primary-50': $route.path === '/contacts/add' }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </RouterLink>

          <div class="h-5 w-px bg-warm-200 mx-1" />

          <!-- Auth section -->
          <div v-if="auth.isAuthenticated" class="flex items-center gap-3">
            <span class="text-sm text-warm-600 font-medium hidden sm:inline">
              {{ auth.user?.username }}
            </span>
            <button
              @click="handleLogout"
              class="text-warm-500 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-rose-50 flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Sair</span>
            </button>
          </div>

          <RouterLink
            v-else
            to="/login"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push('/');
}
</script>
