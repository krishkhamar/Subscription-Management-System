const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from current dir (server)
dotenv.config();

const User = require('./models/User');

const testUser = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'daveheer1136@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found in DB');
            const allUsers = await User.find({}).limit(5);
            console.log('Existing users in DB:', allUsers.map(u => u.email));
            process.exit(1);
        }

        console.log('User found:', user.email, 'Role:', user.role);
        console.log('Hashed Password in DB:', user.password);

        // Common passwords for this hackathon environment
        const passwordsToTry = ['Password123', 'Vivek@123', 'admin123', 'password'];
        
        for (const pass of passwordsToTry) {
            const isMatch = await bcrypt.compare(pass, user.password);
            console.log(`Checking match for "${pass}": ${isMatch ? 'MATCH' : 'FAIL'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic error:', error.message);
        process.exit(1);
    }
};

testUser();
