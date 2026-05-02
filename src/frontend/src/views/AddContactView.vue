<template>
  <div class="max-w-2xl mx-auto">
    <!-- API Error -->
    <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
      {{ store.error }}
    </div>

    <h1 class="text-2xl font-bold text-warm-900 mb-6">Adicionar Contacto</h1>
    <ContactForm @submit="handleSubmit" @cancel="router.push('/')" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useContactsStore } from '../stores/contacts.js';
import ContactForm from '../components/ContactForm.vue';

const router = useRouter();
const store = useContactsStore();

async function handleSubmit(formData) {
  store.error = null;
  try {
    await store.createContact(formData);
    router.push('/');
  } catch {
    // error stays in store.error
  }
}
</script>
