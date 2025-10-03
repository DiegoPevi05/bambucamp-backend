import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import experienceRoutes from './routes/experienceRoutes';
import productRoutes from './routes/productRoutes';
import tentRoutes from './routes/tentRoutes';
import reserveRoutes from './routes/reserveRoutes';
import notificationRoutes from './routes/notificationRoutes';
import discountRoutes from './routes/discountCodesRoutes';
import path from 'path';
import i18nextMiddleware from 'i18next-http-middleware';
import i18next from './config/i18n';
import webRoutes from './routes/webRoutes';
import statisticRoutes from './routes/statisticRoutes';

const app = express();
const server = http.createServer(app);

/************************* CHAT IS NOT ENABLE FOR THIS PROJECT ******************************/
/*const io = new SocketIOServer(server, {
  cors: {
    origin: [process.env.ADMIN_HOSTNAME || 'http://localhost:5173' , process.env.CLIENT_HOSTNAME || 'http://localhost:5174'], // Replace with your client’s origin
    methods: ['GET', 'POST'], // Include additional methods
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});*/

app.use(i18nextMiddleware.handle(i18next));

app.use(cors({
  origin: [process.env.ADMIN_HOSTNAME || 'http://localhost:5173',process.env.ADMIN_HOSTNAME_2 || 'http://localhost:5172', process.env.CLIENT_HOSTNAME_2 || 'http://localhost:5174', process.env.CLIENT_HOSTNAME || 'http://localhost:5173'], // Replace with your client’s origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include additional methods
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

app.use(bodyParser.json());

app.use('/public/images', express.static(path.join(__dirname, '../public/images')));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/experiences', experienceRoutes);
app.use('/products', productRoutes);
app.use('/discounts', discountRoutes);
app.use('/tents', tentRoutes);
app.use('/reserves', reserveRoutes);
app.use('/notifications', notificationRoutes);
app.use('/web', webRoutes);
app.use('/statistics', statisticRoutes);

/************************* CHAT IS NOT ENABLE FOR THIS PROJECT ******************************/
//app.use('/chats', chatRoutes);
//chatHandler(io);

export default server;
