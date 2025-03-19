import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // Create new user if doesn't exist
        user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            userName: profile.emails[0].value.split('@')[0], // Create username from email
            profilePic: profile.photos[0].value
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// @desc    Google Auth Route
// @route   GET /api/v1/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// @desc    Google Auth Callback
// @route   GET /api/v1/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    })(req, res);
}; 