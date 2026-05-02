<template>
  <div class="bg-white rounded-xl shadow-sm border border-warm-200 overflow-hidden hover:shadow-md transition-all duration-200">
    <!-- Image area -->
    <div class="h-48 bg-warm-100 relative overflow-hidden">
      <img
        v-if="contact.picture"
        :src="imageUrl(contact.picture)"
        class="w-full h-full object-cover"
        alt="Foto do contacto"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-100 to-warm-200">
        <div class="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center text-3xl font-bold text-warm-400">
          {{ initials }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <h3 class="font-semibold text-warm-900 text-lg truncate">{{ contact.name }}</h3>
      <p class="text-xs text-warm-400 mt-0.5 truncate">ID: {{ contact.id }}</p>
      <p v-if="contact.contact" class="text-sm text-warm-600 mt-1 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {{ contact.contact }}
      </p>
      <p v-if="contact.email" class="text-sm text-warm-500 mt-0.5 flex items-center gap-1.5 truncate">
        <svg class="w-4 h-4 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="truncate">{{ contact.email }}</span>
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-2 mt-4 pt-4 border-t border-warm-100">
        <!-- Ver button: visible to everyone, redirects to login if not authenticated -->
        <button
          @click="handleView"
          class="flex-1 bg-warm-50 hover:bg-warm-100 text-warm-700 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver
        </button>
        <!-- Edit/Delete: authenticated only -->
        <template v-if="auth.isAuthenticated">
          <button
            @click="$emit('edit', contact.id)"
            class="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
          <button
            @click="$emit('delete', contact)"
            class="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Apagar
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { resolveImageUrl } from '../utils/imageUrl.js';

const props = defineProps({
  contact: { type: Object, required: true }
});

const emit = defineEmits(['view', 'edit', 'delete']);

const auth = useAuthStore();
const router = useRouter();

const initials = computed(() => {
  if (!props.contact.name) return '';
  return props.contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

function imageUrl(filename) {
  return resolveImageUrl(filename);
}

function handleView() {
  if (auth.isAuthenticated) {
    emit('view', props.contact.id);
  } else {
    router.push('/login');
  }
}
</script>
