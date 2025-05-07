const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conectarDB = require('./config/db');
conectarDB(); // <--- conecta a MongoDB

const app = express();
app.use(cors());
app.use(express.json());

const inversorRoutes = require('./routes/inversor.routes');
app.use('/api/inversores', inversorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
const sosenRoutes = require('./routes/sosen.routes');
app.use('/api/sosen', sosenRoutes);
