import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import adminRoutes from './routes/adminRoutes';
import storageRoutes from './routes/storageRoutes';
import shipperRoutes from './routes/shipperRoutes';
import userRoutes from './routes/userRoutes';
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import refreshTokenRoutes from './routes/refreshTokenRoutes';
import cartRoutes from './routes/cartRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Too many requests, try again in 5 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());
app.disable('x-powered-by');

app.use('/refresh', refreshTokenRoutes);

app.use('/admin', adminRoutes);
app.use('/storage', storageRoutes);
app.use('/shipper', shipperRoutes);
app.use('/users', userRoutes);
app.use('/cart', cartRoutes);
app.use('/store', storeRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

export default app;

