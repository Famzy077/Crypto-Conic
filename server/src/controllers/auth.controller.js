const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({success: false, message: "Email and Password are required"});
        }

        const existingUser = await prisma.user.findUnique({where: {email}});
        if(existingUser){
            return res.status(400).json({success: false, message: "User with this email already exists."})
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {email, password: hashedPassword},
        });

        // Ensure the JWT payload is consistent with login and Google auth
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {expiresIn: '20d'});
        res.status(201).json({ success: true, message: 'User registered successfully.', token });
    } catch (error) {
        console.error("--- Register Error ---", { message: error.message });
        res.status(500).json({ success: false, message: 'Internal server error.' });       
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ success: true, message: 'Login successful.', token });
    } catch (error) {
        console.error("--- Login Error ---", { message: error.message });
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getMe = async (req, res) => {
    // Safely access the userId from the request object
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, avatarUrl: true },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("--- Get Me Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
};

module.exports = {
    register,
    login,
    getMe,
};