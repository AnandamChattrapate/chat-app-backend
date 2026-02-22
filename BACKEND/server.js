// 1. Imports
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

// 2. Middleware
app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// 3. Database connection
db();

// 4. Routes - THIS is where app._router gets created
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// 5. Test routes (can go here or after)
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', time: new Date().toISOString() });
});

// 6. DEBUG ROUTE - MUST come AFTER all other routes
// Add this AFTER all your routes are registered
app.get('/debug-routes', (req, res) => {
  try {
    // Check if _router exists
    if (!app._router) {
      return res.json({ 
        message: 'No routes registered yet',
        routes: [] 
      });
    }

    const routes = [];
    
    // Safely iterate through stack
    app._router.stack.forEach((layer) => {
      if (layer.route) {
        // Direct routes
        routes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Router-mounted routes - get the base path
        const basePath = layer.regexp
          .toString()
          .split('\\/')[1]
          ?.split('?')[0] || '';
          
        layer.handle.stack.forEach((handler) => {
          if (handler.route) {
            const fullPath = basePath ? `/${basePath}${handler.route.path}` : handler.route.path;
            routes.push({
              path: fullPath,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });
    
    res.json({
      message: 'Registered routes',
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

// 7. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
