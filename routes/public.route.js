import { incrementScanCount } from "../controllers/company.controller.js";
import {Router} from 'express';

const publicRoute = Router();


// Used by the mobile phone/scanning page
publicRoute.post("/scan/:batchId", incrementScanCount);

export default publicRoute;