const express = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { contactValidation } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

const router = express.Router();

// GET /contacts -> PUBLICO (qualquer pessoa pode ver lista)
router.get('/', getAll);
// GET /contacts/:id -> PROTEGIDO
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, upload.single('picture'), contactValidation, create);
router.put('/:id', authenticateToken, upload.single('picture'), contactValidation, update);
router.delete('/:id', authenticateToken, remove);

module.exports = router;
