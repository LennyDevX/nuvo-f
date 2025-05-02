import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Nueva ruta de prueba
app.get('/api/test', (_, res) => {
  res.json({ message: 'Ruta de prueba funcionando correctamente!' });
});

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