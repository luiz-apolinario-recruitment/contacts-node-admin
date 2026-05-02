<template>
  <div>
    <div
      class="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer relative"
      :class="previewUrl ? 'border-primary-300 bg-primary-50/30' : 'border-warm-300 bg-warm-50/30'"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Preview -->
      <div v-if="previewUrl" class="mb-3 relative inline-block">
        <img
          :src="previewUrl"
          class="w-28 h-28 rounded-full object-cover mx-auto border-2 border-white shadow-md"
          alt="Preview"
        />
        <button
          type="button"
          @click.stop="removeImage"
          class="absolute -top-1 -right-1 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
          title="Remover imagem"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Placeholder -->
      <div v-else class="mx-auto w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <p class="text-sm text-warm-500">
        <span class="text-primary-600 font-medium">Clique para carregar</span> ou arraste uma imagem
      </p>
      <p class="text-xs text-warm-400 mt-1">JPG, PNG até 5MB</p>
    </div>

    <!-- File name -->
    <p v-if="selectedFile" class="text-xs text-warm-500 mt-2 text-center truncate">
      {{ selectedFile.name }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  initialImage: { type: String, default: null }
});

const emit = defineEmits(['select', 'remove']);

const fileInput = ref(null);
const previewUrl = ref(null);
const selectedFile = ref(null);

// Show initial image if provided (edit mode)
watch(() => props.initialImage, (val) => {
  if (val && !selectedFile.value) {
    previewUrl.value = val;
  }
}, { immediate: true });

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  if (!file.type.startsWith('image/')) {
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    return;
  }

  // Revoke old object URL if exists
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  emit('select', file);
}

function removeImage() {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = null;
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  emit('remove');

  // Restore initial image if in edit mode
  if (props.initialImage) {
    previewUrl.value = props.initialImage;
  }
}

onUnmounted(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>
