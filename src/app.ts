import express from 'express';
import helmet from 'helmet';
import adminRoutes from './routes/adminRoutes';
import storageRoutes from './routes/storageRoutes';
import shipperRoutes from './routes/shipperRoutes';
import userRoutes from './routes/userRoutes';
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import refreshTokenRoutes from './routes/refreshTokenRoutes';
import cartRoutes from './routes/cartRoutes';
import paymentRoutes from './routes/paymentRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middlewares/rateLimiter';
import { handleWebhook } from './controllers/webhookController';
import emailOtpRoutes from './routes/emailOtpRoutes';
import orderRoutes from './routes/orderRoutes';
import notificationRoutes from './routes/notificationRoute'
import discountRoutes from './routes/discountRoutes';

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(globalLimiter);
app.disable('x-powered-by');
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json());
app.use(cookieParser());

app.use('/refresh', refreshTokenRoutes);

app.use('/admin', adminRoutes);
app.use('/storage', storageRoutes);
app.use('/shipper', shipperRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/store', storeRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/payment', paymentRoutes);
app.use('/email-otp', emailOtpRoutes);
app.use('/notifications', notificationRoutes);
app.use('/discounts', discountRoutes);

export default app;

    