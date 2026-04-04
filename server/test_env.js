const dotenv = require('dotenv');
const result = dotenv.config();
console.log('Dotenv result:', result.error ? 'ERROR' : 'OK');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
process.exit(0);
