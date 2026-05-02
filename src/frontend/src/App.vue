<template>
  <div class="min-h-screen bg-warm-50">
    <Navbar />
    <main class="container mx-auto px-4 py-8 max-w-6xl">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();

onMounted(() => {
  auth.checkAuth();
});
</script>
