const contactService = require('../services/contactService');

async function getAll(req, res, next) {
  try {
    const contacts = await contactService.findAll();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const contact = await contactService.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const contact = await contactService.create(req.body, req.file);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const contact = await contactService.update(req.params.id, req.body, req.file);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const success = await contactService.remove(req.params.id);
    if (!success) return res.status(404).json({ error: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
