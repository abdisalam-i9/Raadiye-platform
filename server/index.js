import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDatabase from './config/database.js';
import env from './config/env.js';
import userRouter from './routes/UserRoute.js';
import categoryRouter from './routes/CategoryRoute.js';
import foundItemRouter from './routes/FoundItemRoute.js';
import lostItemRouter from './routes/LostItemRoute.js';
import contactRouter from './routes/ContactRoute.js';
import chatRouter from './routes/ChatRoute.js';
import { attachChatSocket } from './socket/chatSocket.js';
import { expireItems } from './job/expireItems.js';
import { seedCategories } from './seed/categories.js';
import { seedAdmin } from './seed/admin.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  return res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1,
    message: 'ok',
    database: dbStatus,
  });
});

app.use('/api/auth', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/items', foundItemRouter);
app.use('/api/lost-items', lostItemRouter);
app.use('/api/contact', contactRouter);
app.use('/api/chats', chatRouter);

async function startServer() {
  try {
    if (!env.JWT.SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    await connectDatabase();
    await seedCategories();
    await seedAdmin();

    expireItems();
    setInterval(expireItems, 60 * 60 * 1000);

    const PORT = env.PORT;
    const httpServer = http.createServer(app);
    attachChatSocket(httpServer, app);
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
