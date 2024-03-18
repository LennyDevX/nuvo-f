import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '../Routes/Routes.js';

dotenv.config(); // Configura tus variables de entorno

const app = express();

app.use(cors()); // Permitir todas las solicitudes CORS

app.use(express.json()); // Permite que el servidor entienda los JSON

mongoose.connect(process.env.MONGODB_URI) // Conectar con tu base de datos MongoDB
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3002; // Obtener el puerto de la variable de entorno o utilizar el puerto 3002

app.use('/', routes);
   
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
