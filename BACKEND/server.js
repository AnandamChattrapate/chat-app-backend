import cookieParser from 'cookie-parser';
import 'dotenv/config';
import exp from 'express'
import db from './src/config/mongo.setup.js';
import authRouter from './src/routes/authRoutes.js'
import userRouter from './src/routes/userRoutes.js';
import chatRouter from './src/routes/chatRouter.js'
import messageRouter from './src/routes/messageRoutes.js'
import cors from "cors";

const app = exp();

// ✅ 1. FIRST - Set up all middleware
app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use env var for production
  credentials: true
}));

// ✅ 2. THEN - Connect to database
db();

// ✅ 3. THEN - Set up all routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// ✅ 4. FINALLY - Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Routes available:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/user`);
  console.log(`   - /api/chat`);
  console.log(`   - /api/message`);
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Add this TEMPORARY route to see all registered paths
app.get('/debug-routes', (req, res) => {
  const routes = [];
  
  // Extract all registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct routes
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router-mounted routes
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods);
          routes.push({ path, methods });
        }
      });
    }
  });
  
  res.json({
    message: 'All registered routes',
    total: routes.length,
    routes: routes
  });
});
