import express from 'express';
import adminRoutes from './routes/adminRoutes';
import storageRoutes from './routes/storageRoutes';
import shipperRoutes from './routes/shipperRoutes';
import userRoutes from './routes/userRoutes';
import storeRoutes from './routes/storeRoutes';
import categoryRoutes from './routes/categoryRoutes';
import refreshTokenRoutes from './routes/refreshTokenRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/refresh', refreshTokenRoutes);

app.use('/admin', adminRoutes);
app.use('/storage', storageRoutes);
app.use('/shipper', shipperRoutes);
app.use('/users', userRoutes);
app.use('/store', storeRoutes);
app.use('/categories', categoryRoutes);

export default app;

