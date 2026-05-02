<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-xl shadow-xl border border-warm-200 p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.15s_ease-out]">
        <div class="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-warm-900 text-center mb-2">Apagar Contacto</h3>
        <p class="text-sm text-warm-500 text-center mb-6">
          Tem certeza que deseja apagar <strong class="text-warm-800">{{ contactName }}</strong>?<br>Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-3">
          <button
            @click="emit('close')"
            class="flex-1 px-4 py-2.5 border border-warm-300 text-warm-700 rounded-lg hover:bg-warm-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="emit('confirm', contactId)"
            class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  contactName: { type: String, required: true },
  contactId: { type: [String, Number], required: true }
});

const emit = defineEmits(['close', 'confirm']);
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
