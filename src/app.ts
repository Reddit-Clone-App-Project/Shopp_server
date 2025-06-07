import express from 'express';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import refreshTokenRoutes from './routes/refreshTokenRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/refresh', refreshTokenRoutes);

app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

export default app;

