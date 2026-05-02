const contactRepository = require('../repositories/contactRepository');
const { Contact } = require('../models/Contact');
const fs = require('fs');
const path = require('path');
const { UPLOADS_DIR } = require('../config/paths');

async function findAll() {
  return contactRepository.findAll();
}

async function findById(id) {
  return contactRepository.findById(id);
}

async function create(data, file) {
  // Verificar duplicidade de email
  const existingEmail = await contactRepository.findByEmail(data.email);
  if (existingEmail) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  // Verificar duplicidade de contact
  const existingContact = await contactRepository.findByContact(data.contact);
  if (existingContact) {
    const error = new Error('Contact already in use');
    error.status = 409;
    throw error;
  }

  const picture = file ? `/uploads/${file.filename}` : null;
  if (!picture) {
    const error = new Error('Picture is required');
    error.status = 400;
    throw error;
  }

  const contact = new Contact({
    name: data.name,
    contact: data.contact,
    email: data.email,
    picture
  });

  return contactRepository.create(contact.toJSON());
}

async function update(id, data, file) {
  const existing = await contactRepository.findById(id);
  if (!existing) {
    const error = new Error('Contact not found');
    error.status = 404;
    throw error;
  }

  // Verificar duplicidade de email se alterado
  if (data.email && data.email !== existing.email) {
    const dupEmail = await contactRepository.findByEmail(data.email);
    if (dupEmail && dupEmail.id !== id) {
      const error = new Error('Email already in use');
      error.status = 409;
      throw error;
    }
  }

  // Verificar duplicidade de contact se alterado
  if (data.contact && data.contact !== existing.contact) {
    const dupContact = await contactRepository.findByContact(data.contact);
    if (dupContact && dupContact.id !== id) {
      const error = new Error('Contact already in use');
      error.status = 409;
      throw error;
    }
  }

  let picture = existing.picture;
  if (file) {
    // Apagar imagem anterior se existir
    const oldFilename = path.basename(existing.picture);
    const oldPath = path.join(UPLOADS_DIR, oldFilename);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
    picture = `/uploads/${file.filename}`;
  }

  const updateData = {
    ...(data.name && { name: data.name }),
    ...(data.contact && { contact: data.contact }),
    ...(data.email && { email: data.email }),
    picture
  };

  return contactRepository.update(id, updateData);
}

async function remove(id) {
  const existing = await contactRepository.findById(id);
  if (!existing) {
    const error = new Error('Contact not found');
    error.status = 404;
    throw error;
  }

  // Apagar imagem associada
  if (existing.picture) {
    const filename = path.basename(existing.picture);
    const imagePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  return contactRepository.delete(id);
}

module.exports = { findAll, findById, create, update, remove };
