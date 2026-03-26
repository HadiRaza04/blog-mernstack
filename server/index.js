import express from 'express';
import { PORT } from './env.js';
import userRouter from './routes/userRoutes.js'
import connectDB from './config/db.js';
import postRouter from './routes/postRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import cors from 'cors';

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
connectDB()

app.get('/', (req, res) => res.send("Hello"));

app.use('/api/auth', userRouter)
app.use('/api/posts', postRouter)
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>  console.log(`Server is listening on port ${PORT}`));