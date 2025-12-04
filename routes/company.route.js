import {getDashboardStats, createFlourBatch} from "../controllers/company.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import {Router} from "express";

const companyRouter = Router();


companyRouter.get("/dashboard", verifyToken, getDashboardStats);
companyRouter.post("/flourbatches", verifyToken, createFlourBatch);


export default companyRouter;