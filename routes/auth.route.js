import { signIn, SignUp } from "../controllers/auth.controllers.js";
import { Router } from "express";
import upload  from "../middlewares/multer.js"


const authRouter = Router();

authRouter.post('/sign-up', upload.single('logo'), SignUp);
authRouter.post('/sign-in', upload.none(), signIn);


export default authRouter;