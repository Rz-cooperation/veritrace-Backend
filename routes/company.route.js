import {getDashboardStats, createFlourBatch, getFlourBatches, createProductionBatch, getProductionBatches, generateQR, getScanStats, getFraudAlerts, getScanAnalytics} from "../controllers/company.controller.js"
import {getActivityLogs} from "../controllers/activity.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import {Router} from "express";

const companyRouter = Router();


companyRouter.get("/dashboard", verifyToken, getDashboardStats);
companyRouter.post("/flourbatches", verifyToken, createFlourBatch);
companyRouter.get("/getflourbatches", verifyToken, getFlourBatches);
companyRouter.post("/productionBatches", verifyToken, createProductionBatch)
companyRouter.get("/getproductionbatches", verifyToken, getProductionBatches);
companyRouter.post("/batch/:id/qr", verifyToken, generateQR);
companyRouter.get("/analytics/:batchId", verifyToken, getScanStats);
companyRouter.get("/fraud-alerts", verifyToken, getFraudAlerts);
companyRouter.get("/scan-analytics", verifyToken, getScanAnalytics);
companyRouter.get("/activity-logs", verifyToken, getActivityLogs);


export default companyRouter;