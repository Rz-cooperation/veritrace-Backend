import express from 'express';
import { PORT } from './config/env.js';
import {databaseConnection} from './database/mongoDB.js'
import authRouter from './routes/auth.route.js';
import companyRouter from './routes/company.route.js'


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1', authRouter);
app.use('/api/v1/company', companyRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Something went wrong",
        err: err.message
    });
});



app.listen(PORT, async () => {
    console.log("server is listening");
    await databaseConnection();
});