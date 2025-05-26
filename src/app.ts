import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

export default app;

