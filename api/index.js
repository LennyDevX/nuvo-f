import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRouter from './gemini/index.js';

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación express
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hola desde el servidor de Nuvos-App!' });
});

// Usar el router de Gemini
app.use('/api/gemini', geminiRouter);

// Verificar el entorno de ejecución
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  // En Vercel, exportamos la aplicación como un módulo
  console.log('Running on Vercel');
} else {
  // En desarrollo, iniciamos el servidor
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Export the app at the top level
export default app;