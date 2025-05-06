import express from 'express';
import cors from 'cors';
import env from './config/environment.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';

// Crear la aplicación express
const app = express();
const port = env.port;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/server', routes);

// Middleware de manejo de errores (debe estar al final)
app.use(errorHandler);

// Verificar el entorno de ejecución
if (env.isVercel) {
  // En Vercel, exportamos la aplicación como un módulo
  console.log('Running on Vercel');
} else {
  // En desarrollo, iniciamos el servidor
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Export the app for serverless environments
export default app;