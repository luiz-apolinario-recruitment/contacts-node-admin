import { defineStore } from 'pinia';
import { ref } from 'vue';
import { readApiError } from '../utils/apiError.js';

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref([]);
  const currentContact = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchContacts() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch('/api/contacts', { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao carregar contactos');
      contacts.value = await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchContact(id) {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`/api/contacts/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao carregar contacto');
      currentContact.value = await res.json();
      return currentContact.value;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createContact(formData) {
    error.value = null;
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Erro ao criar contacto'));
      }
      const contact = await res.json();
      contacts.value.unshift(contact);
      return contact;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateContact(id, formData) {
    error.value = null;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Erro ao atualizar contacto'));
      }
      const contact = await res.json();
      const idx = contacts.value.findIndex(c => c.id === id);
      if (idx !== -1) contacts.value[idx] = contact;
      if (currentContact.value?.id === id) currentContact.value = contact;
      return contact;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteContact(id) {
    error.value = null;
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(await readApiError(res, 'Erro ao apagar contacto'));
      contacts.value = contacts.value.filter(c => c.id !== id);
      if (currentContact.value?.id === id) currentContact.value = null;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    contacts,
    currentContact,
    loading,
    error,
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact
  };
});
