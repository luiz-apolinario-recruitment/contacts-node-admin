/**
 * Contact Model
 * Represents a Contact entity in the application.
 * 
 * Schema:
 * - id: string/UUID (VARCHAR(36) PRIMARY KEY)
 * - name: string, > 5 characters (VARCHAR(255) NOT NULL)
 * - contact: string, EXACTLY 9 digits (VARCHAR(9) NOT NULL)
 * - email: string, valid, UNIQUE in database (VARCHAR(255) NOT NULL UNIQUE)
 * - picture: URL/path of image (VARCHAR(500) NOT NULL)
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 */

const { v4: uuidv4 } = require('uuid');

class Contact {
  constructor({ id, name, contact, email, picture, created_at, updated_at }) {
    this.id = id || uuidv4();
    this.name = name;
    this.contact = contact;
    this.email = email;
    this.picture = picture;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      contact: this.contact,
      email: this.email,
      picture: this.picture,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = { Contact };
