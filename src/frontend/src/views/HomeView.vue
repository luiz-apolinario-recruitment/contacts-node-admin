<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-warm-900">Contactos</h1>
      <RouterLink
        v-if="auth.isAuthenticated"
        to="/contacts/add"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Contacto
      </RouterLink>
      <RouterLink
        v-else
        to="/login"
        class="bg-white border border-warm-300 hover:bg-warm-100 text-warm-700 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login para gerir
      </RouterLink>
    </div>

    <!-- Error (non-blocking) -->
    <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
      {{ store.error }}
      <button @click="store.error = null" class="ml-2 text-red-800 hover:text-red-900 underline text-xs">Fechar</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.contacts.length === 0" class="text-center py-16">
      <div class="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-warm-500 text-lg">Nenhum contacto encontrado.</p>
      <p v-if="auth.isAuthenticated" class="text-warm-400 text-sm mt-1">Adicione o primeiro contacto!</p>
    </div>

    <!-- Contact grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ContactCard
        v-for="contact in store.contacts"
        :key="contact.id"
        :contact="contact"
        @view="goToDetail"
        @edit="goToEdit"
        @delete="openDeleteModal"
      />
    </div>

    <!-- Delete Modal -->
    <DeleteModal
      v-if="deleteTarget"
      :contact-name="deleteTarget.name"
      :contact-id="deleteTarget.id"
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContactsStore } from '../stores/contacts.js';
import { useAuthStore } from '../stores/auth.js';
import ContactCard from '../components/ContactCard.vue';
import DeleteModal from '../components/DeleteModal.vue';

const router = useRouter();
const store = useContactsStore();
const auth = useAuthStore();

const deleteTarget = ref(null);

onMounted(() => {
  store.fetchContacts();
});

function goToDetail(id) {
  router.push(`/contacts/${id}`);
}

function goToEdit(id) {
  router.push(`/contacts/${id}/edit`);
}

function openDeleteModal(contact) {
  deleteTarget.value = contact;
}

async function confirmDelete(id) {
  try {
    await store.deleteContact(id);
    deleteTarget.value = null;
  } catch {
    // error is in store.error, displayed above
    deleteTarget.value = null;
  }
}
</script>
