import express from 'express';
import { PORT } from './config/env.js';
import {databaseConnection} from './database/mongoDB.js'


const app = express();


app.listen(PORT, async () => {
    console.log("server is listening");
    await databaseConnection();
});