<template>
  <div class="max-w-2xl mx-auto">
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

    <!-- Contact detail -->
    <div v-else-if="contact" class="bg-white rounded-xl shadow-sm border border-warm-200 overflow-hidden">
      <div class="h-64 bg-warm-100 relative">
        <img
          v-if="contact.picture"
          :src="imageUrl(contact.picture)"
          class="w-full h-full object-cover"
          alt="Foto do contacto"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-100 to-warm-200">
          <div class="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center text-4xl font-bold text-warm-400">
            {{ initials }}
          </div>
        </div>
        <button
          @click="router.push('/')"
          class="absolute top-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-warm-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
      </div>

      <div class="p-6">
        <h1 class="text-2xl font-bold text-warm-900 mb-1">{{ contact.name }}</h1>

        <div class="mt-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h10M7 17h6" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-xs text-warm-500 font-medium uppercase tracking-wider">ID</p>
              <p class="text-warm-900 font-medium break-all">{{ contact.id }}</p>
            </div>
          </div>

          <div v-if="contact.contact" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-warm-500 font-medium uppercase tracking-wider">Contacto</p>
              <p class="text-warm-900 font-medium">{{ contact.contact }}</p>
            </div>
          </div>

          <div v-if="contact.email" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-warm-500 font-medium uppercase tracking-wider">Email</p>
              <p class="text-warm-900 font-medium">{{ contact.email }}</p>
            </div>
          </div>
        </div>

        <div v-if="auth.isAuthenticated" class="flex gap-3 mt-8 pt-6 border-t border-warm-100">
          <button
            @click="router.push(`/contacts/${contact.id}/edit`)"
            class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
          <button
            @click="openDeleteModal"
            class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Apagar
          </button>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-16">
      <p class="text-warm-500 text-lg">Contacto não encontrado.</p>
      <button @click="router.push('/')" class="mt-4 text-primary-600 hover:text-primary-700 font-medium">
        Voltar à lista
      </button>
    </div>

    <!-- Delete Modal -->
    <DeleteModal
      v-if="showDeleteModal && contact"
      :contact-name="contact.name"
      :contact-id="contact.id"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContactsStore } from '../stores/contacts.js';
import { useAuthStore } from '../stores/auth.js';
import DeleteModal from '../components/DeleteModal.vue';
import { resolveImageUrl } from '../utils/imageUrl.js';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const store = useContactsStore();
const auth = useAuthStore();

const showDeleteModal = ref(false);

const contact = computed(() => store.currentContact);

const initials = computed(() => {
  if (!contact.value?.name) return '';
  return contact.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

function imageUrl(filename) {
  return resolveImageUrl(filename);
}

function openDeleteModal() {
  showDeleteModal.value = true;
}

async function confirmDelete(id) {
  try {
    await store.deleteContact(id);
    showDeleteModal.value = false;
    router.push('/');
  } catch {
    // error in store
  }
}

onMounted(() => {
  store.fetchContact(props.id);
});
</script>
