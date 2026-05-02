<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-warm-900 mb-6">Editar Contacto</h1>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center mb-6">
      {{ store.error }}
    </div>

    <!-- Form -->
    <ContactForm
      v-else-if="contact"
      :is-edit="true"
      :contact-id="id"
      :initial-data="contact"
      @submit="handleSubmit"
      @cancel="router.push('/')"
    />

    <!-- Not found -->
    <div v-else class="text-center py-16">
      <p class="text-warm-500 text-lg">Contacto não encontrado.</p>
      <button @click="router.push('/')" class="mt-4 text-primary-600 hover:text-primary-700 font-medium">
        Voltar à lista
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContactsStore } from '../stores/contacts.js';
import ContactForm from '../components/ContactForm.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const store = useContactsStore();

const contact = ref(null);

async function handleSubmit(formData) {
  store.error = null;
  try {
    await store.updateContact(props.id, formData);
    router.push(`/contacts/${props.id}`);
  } catch {
    // error stays in store.error
  }
}

onMounted(async () => {
  store.error = null;
  const fetched = await store.fetchContact(props.id);
  if (fetched) {
    contact.value = fetched;
  }
});
</script>
