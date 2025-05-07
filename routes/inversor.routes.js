const express = require('express');
const router = express.Router();
const { obtenerTodos, crearInversor } = require('../controllers/inversor.controller');

router.get('/', obtenerTodos);
router.post('/', crearInversor);

module.exports = router;
