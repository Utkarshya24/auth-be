import express from 'express';
import { googleAuth, googleCallback } from '../controllers/googleAuthController.js';

const router = express.Router();

// Google Auth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router; 