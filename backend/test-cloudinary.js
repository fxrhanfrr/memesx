import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Testing Cloudinary Configuration...\n');

// Check if environment variables are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');

if (!cloudName || !apiKey || !apiSecret) {
  console.log('\n❌ Missing Cloudinary credentials!');
  console.log('Please check your .env file and add:');
  console.log('CLOUDINARY_CLOUD_NAME=your-cloud-name');
  console.log('CLOUDINARY_API_KEY=your-api-key');
  console.log('CLOUDINARY_API_SECRET=your-api-secret');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('\n🔧 Testing Cloudinary connection...');

// Test the connection by getting account info
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    console.log('\n🎉 Your Cloudinary setup is working correctly!');
  })
  .catch(error => {
    console.log('❌ Cloudinary connection failed!');
    console.log('Error:', error.message);
    console.log('\nPlease check your credentials in the .env file.');
  });
