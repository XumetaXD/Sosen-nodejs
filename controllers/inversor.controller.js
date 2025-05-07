const Inversor = require('../models/Inversor');

// Obtener todos
const obtenerTodos = async (req, res) => {
  try {
    const inversores = await Inversor.find();
    res.json(inversores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener inversores' });
  }
};

// Crear nuevo
const crearInversor = async (req, res) => {
  try {
    const nuevo = new Inversor(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear inversor' });
  }
};

module.exports = { obtenerTodos, crearInversor };
