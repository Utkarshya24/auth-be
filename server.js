import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import axios from "axios"
import getZohoAccessToken from "./utils/zoho_auth.js"
import exphbs from "express-handlebars"

dotenv.config();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set up Handlebars view engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Initialize Passport
app.use(passport.initialize());

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

app.get('/api/customers', async (req, res) => {
  try {
      const accessToken = await getZohoAccessToken();

      const response = await axios.get(`https://www.zohoapis.com/subscriptions/v1/customers`, {
          headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              'X-com-zoho-subscriptions-organizationid': process.env.ZOHO_ORG_ID,
          },
      });

      res.json(response.data);
  } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
