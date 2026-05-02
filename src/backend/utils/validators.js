function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 5 && trimmed.length <= 255;
}

function isValidContact(contact) {
  if (!contact || typeof contact !== 'string') return false;
  const re = /^[0-9]{9}$/;
  return re.test(contact.trim());
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

module.exports = { isValidName, isValidContact, isValidEmail };
