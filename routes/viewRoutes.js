import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route for Google Auth Test page
router.get('/google-auth-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default router; 