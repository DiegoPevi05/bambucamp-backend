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

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/experiences', experienceRoutes);
app.use('/products', productRoutes);
app.use('/promotions', promotionRoutes);
app.use('/tents', tentRoutes);

export default app;
