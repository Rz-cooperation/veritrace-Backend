import dotenv from 'dotenv';

const {config} = dotenv;

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});//path: .env.developmental.local


export const {
    PORT,
    MONGODB_URL,
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET,
    JWT_EXPIRES_IN,
    JWT_SECRET
} = process.env