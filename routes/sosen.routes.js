const express = require('express');
const router = express.Router();
const { getRealtimeData } = require('../services/sosenService');

router.get('/realtime', async (req, res) => {
  try {
    const data = await getRealtimeData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos en tiempo real de SOSEN' });
  }
});

module.exports = router;
