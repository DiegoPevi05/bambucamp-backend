import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import experienceRoutes from './routes/experienceRoutes';
import productRoutes from './routes/productRoutes';
import promotionRoutes from './routes/promotionRoutes';
import tentRoutes from './routes/tentRoutes';
import reserveRoutes from './routes/reserveRoutes';
import discountRoutes from './routes/discountCodesRoutes';
import path from 'path';
import i18nextMiddleware from 'i18next-http-middleware';
import i18next from './config/i18n';

const app = express();

app.use(i18nextMiddleware.handle(i18next));
app.use(cors());
app.use(bodyParser.json());
// Serve static files
app.use('/public/images', express.static(path.join(__dirname, '../public/images')));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/experiences', experienceRoutes);
app.use('/products', productRoutes);
app.use('/discounts',discountRoutes);
app.use('/promotions', promotionRoutes);
app.use('/tents', tentRoutes);
app.use('/reserves', reserveRoutes);

export default app;
