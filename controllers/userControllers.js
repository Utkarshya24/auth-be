import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, userName  } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({ 
                message: userExists.email === email ? 
                    "Email already registered" : 
                    "Username already taken" 
            });
        }

        console.log("user registered succefully",userExists)

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            userName
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userName: user.userName,
                role: user.role,
                profilePic: user.profilePic,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userName: user.userName,
                role: user.role,
                profilePic: user.profilePic,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userName: user.userName,
                role: user.role,
                profilePic: user.profilePic
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if username is being updated and is unique
            if (req.body.userName && req.body.userName !== user.userName) {
                const userNameExists = await User.findOne({ userName: req.body.userName });
                if (userNameExists) {
                    return res.status(400).json({ message: "Username already taken" });
                }
            }

            // Check if email is being updated and is unique
            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({ email: req.body.email });
                if (emailExists) {
                    return res.status(400).json({ message: "Email already registered" });
                }
            }

            user.name = req.body.name || user.name;
            user.userName = req.body.userName || user.userName;
            user.email = req.body.email || user.email;
            user.profilePic = req.body.profilePic || user.profilePic;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                userName: updatedUser.userName,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generate JWT Token
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User removed" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
