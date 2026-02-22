
// // import { verifyToken } from '../middleware/auth.js';
// import express from 'express';
// import { createUser, loginUser, logoutUser } from '../controllers/authController.js';
// const authRouter = express.Router();
// authRouter.post('/signup', createUser);
// authRouter.post('/login', loginUser);
// authRouter.post('/logout', logoutUser);

// export default authRouter;
import express from 'express';
import { createUser, loginUser, logoutUser } from '../controllers/authController.js';

const authRouter = express.Router();

// These should create routes at /signup and /login
authRouter.post('/signup', createUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);

// Add a test route for this router
authRouter.get('/ping', (req, res) => {
  res.json({ message: 'Auth router is alive' });
});

export default authRouter;  // This is CRITICAL
