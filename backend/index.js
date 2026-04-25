require('dotenv').config(); // Carga las variables de entorno PRIMERO

const express = require('express');
const cors = require('cors');
const connectDB = require('./Config/db');

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientsRoutes = require('./routes/clientsRoutes');


const app = express();

// Middleware CORS (configuración segura para producción)
const allowedOrigins = [
  process.env.FRONTEND_URL, // Netlify o dominio que pongas en .env
  'https://agronat.netlify.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight para todos los métodos

// Middleware global
app.use(express.json());

// Conexión a la base de datos
connectDB(); // Asegurate que use process.env.MONGODB_URI

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientsRoutes);



// Health check para cronjob (Railway o similares)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active' });
});

// Middleware de erroresnpm run dev

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Puerto y arranque del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
