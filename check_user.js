const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./server/models/User');

dotenv.config();

const testUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'daveheer1136@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.email, 'Role:', user.role);
        console.log('Hashed Password in DB:', user.password);

        // We don't know the plain password, but usually it's something like 'password123' 
        // based on common hackathon defaults or previous context if available.
        // Let's check common ones to see if they work.
        const passwordsToTry = ['password123', 'Password123', 'Vivek@123', 'admin123'];
        
        for (const pass of passwordsToTry) {
            const isMatch = await user.matchPassword(pass);
            console.log(`Trying password "${pass}": ${isMatch ? 'MATCH' : 'FAIL'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testUser();
