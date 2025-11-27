import dotenv from 'dotenv';

const {config} = dotenv;

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});//path: .env.developmental.local


export const {
    PORT,
    MONGODB_URI
} = process.env