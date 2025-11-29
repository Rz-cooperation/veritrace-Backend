import mongoose from 'mongoose';
import { MONGODB_URL } from '../config/env.js';


export const databaseConnection = async() => {
    try{
        await mongoose.connect(MONGODB_URL);
        console.log("Connection to the database successful");
    } catch(error) {
        console.log("Something went wrong", error);
    }
}