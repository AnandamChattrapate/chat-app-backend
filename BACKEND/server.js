import cookieParser from 'cookie-parser';
import 'dotenv/config';
import exp from 'express';
import db from './src/config/mongo.setup.js';
import authRouter from './src/routes/authRoutes.js';
import userRouter from './src/routes/userRoutes.js';
import chatRouter from './src/routes/chatRouter.js';
import messageRouter from './src/routes/messageRoutes.js';
import cors from "cors";

const app = exp();

// 1. FIRST - Set up all middleware
app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: https://chat-app-frontend-2bku.onrender.com ||process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// 2. THEN - Connect to database (don't await here)
db();

// 3. THEN - Register ALL routes
console.log('📝 Registering routes...');

app.use('/api/auth', authRouter);
console.log('✅ /api/auth routes registered');

app.use('/api/user', userRouter);
console.log('✅ /api/user routes registered');

app.use('/api/chat', chatRouter);
console.log('✅ /api/chat routes registered');

app.use('/api/message', messageRouter);
console.log('✅ /api/message routes registered');

// 4. Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// 5. Debug route - NOW it will see all routes
app.get('/debug-routes', (req, res) => {
  try {
    if (!app._router) {
      return res.json({ 
        message: 'Routes not yet initialized',
        note: 'This should not happen if routes are registered before server starts'
      });
    }

    const routes = [];
    
    app._router.stack.forEach((layer) => {
      if (layer.route) {
        // Direct routes
        routes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Router-mounted routes
        const basePath = layer.regexp
          .toString()
          .replace('/^\\//', '')
          .replace('\\/?(?=\\/|$)/i', '')
          .replace(/\\\//g, '/')
          .replace('^', '');
          
        layer.handle.stack.forEach((handler) => {
          if (handler.route) {
            const fullPath = basePath === '/' 
              ? handler.route.path 
              : `${basePath}${handler.route.path}`;
            routes.push({
              path: fullPath,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });
    
    res.json({
      message: 'Routes registered successfully',
      total: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({ 
      message: 'Error getting routes',
      error: err.message 
    });
  }
});

// 6. FINALLY - Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log('📌 Available endpoints:');
  console.log('   → /test');
  console.log('   → /debug-routes');
  console.log('   → /api/auth/*');
  console.log('   → /api/user/*');
  console.log('   → /api/chat/*');
  console.log('   → /api/message/*');
  console.log('='.repeat(50) + '\n');
});
