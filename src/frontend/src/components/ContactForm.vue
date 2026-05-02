<template>
  <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-warm-200 p-6 space-y-5">
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-warm-700 mb-1">
        Nome <span class="text-rose-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        :class="['w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all',
          errors.name ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-warm-300 focus:ring-primary-500 focus:border-primary-500']"
        placeholder="Nome completo (mínimo 6 caracteres)"
      />
      <p v-if="errors.name" class="text-rose-600 text-xs mt-1">{{ errors.name }}</p>
    </div>

    <!-- Contact (9 digits) -->
    <div>
      <label class="block text-sm font-medium text-warm-700 mb-1">
        Contacto <span class="text-rose-500">*</span>
      </label>
      <input
        v-model="form.contact"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]{9}"
        maxlength="9"
        :class="['w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all',
          errors.contact ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-warm-300 focus:ring-primary-500 focus:border-primary-500']"
        placeholder="912345678"
      />
      <p v-if="errors.contact" class="text-rose-600 text-xs mt-1">{{ errors.contact }}</p>
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-warm-700 mb-1">
        Email <span class="text-rose-500">*</span>
      </label>
      <input
        v-model="form.email"
        type="email"
        :class="['w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all',
          errors.email ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-warm-300 focus:ring-primary-500 focus:border-primary-500']"
        placeholder="email@exemplo.pt"
      />
      <p v-if="errors.email" class="text-rose-600 text-xs mt-1">{{ errors.email }}</p>
    </div>

    <!-- Picture -->
    <div>
      <label class="block text-sm font-medium text-warm-700 mb-1">
        Fotografia <span v-if="!isEdit" class="text-rose-500">*</span>
      </label>
      <ImageUpload
        :initial-image="isEdit && initialData?.picture ? imageUrl(initialData.picture) : null"
        @select="handleImageSelect"
        @remove="handleImageRemove"
      />
      <p v-if="errors.picture" class="text-rose-600 text-xs mt-1">{{ errors.picture }}</p>
    </div>

    <!-- Buttons -->
    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {{ isEdit ? 'Atualizar Contacto' : 'Salvar Contacto' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-2.5 border border-warm-300 text-warm-700 rounded-lg hover:bg-warm-100 transition-colors font-medium"
      >
        Cancelar
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import ImageUpload from './ImageUpload.vue';
import { resolveImageUrl } from '../utils/imageUrl.js';

const props = defineProps({
  isEdit: { type: Boolean, default: false },
  contactId: { type: String, default: null },
  initialData: { type: Object, default: null }
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  name: '',
  contact: '',
  email: '',
  picture: null,
  removePicture: false
});

const errors = reactive({
  name: '',
  contact: '',
  email: '',
  picture: ''
});

const submittedOnce = ref(false);

// Pre-fill on edit
watch(() => props.initialData, (data) => {
  if (data) {
    form.name = data.name || '';
    form.contact = data.contact || '';
    form.email = data.email || '';
    form.picture = null;
    form.removePicture = false;
    clearErrors();
    submittedOnce.value = false;
  }
}, { immediate: true });

function handleImageSelect(file) {
  form.picture = file;
  form.removePicture = false;
  if (submittedOnce.value) validate();
}

function handleImageRemove() {
  form.picture = null;
  form.removePicture = true;
  if (submittedOnce.value) validate();
}

function imageUrl(filename) {
  return resolveImageUrl(filename);
}

function clearErrors() {
  errors.name = '';
  errors.contact = '';
  errors.email = '';
  errors.picture = '';
}

function validate() {
  let valid = true;
  clearErrors();

  if (!form.name || form.name.trim().length < 6) {
    errors.name = 'O nome deve ter pelo menos 6 caracteres.';
    valid = false;
  }

  const contactClean = (form.contact || '').replace(/\D/g, '');
  if (!contactClean || contactClean.length !== 9) {
    errors.contact = 'O contacto deve ter exatamente 9 dígitos.';
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !emailRegex.test(form.email.trim())) {
    errors.email = 'Introduza um email válido.';
    valid = false;
  }

  if (!props.isEdit && !form.picture) {
    errors.picture = 'Selecione uma fotografia.';
    valid = false;
  }

  return valid;
}

function handleSubmit() {
  submittedOnce.value = true;
  if (!validate()) return;

  const formData = new FormData();
  formData.append('name', form.name.trim());
  formData.append('contact', form.contact.replace(/\D/g, ''));
  formData.append('email', form.email.trim());
  if (form.picture) {
    formData.append('picture', form.picture);
  }
  if (props.isEdit && form.removePicture) {
    formData.append('removePicture', 'true');
  }

  emit('submit', formData);
}
</script>
