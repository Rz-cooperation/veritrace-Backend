import Auth from '../models/auth.model.js'
import mongoose from 'mongoose';
import bcrypt from bcrypt;






export const SignUp = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const {companyName, password, logo, companyMail,  companyAddress, productDescription} = req.body;

    if(!companyName ||!password || !logo || !companyMail || !companyAddress || !productDescription){
        return res.status(400).json({message: "All fields are required!"});
    }

    const company = await Auth.findOne({companyMail}).session(session);

    if(company){
        return res.status(400).json({message: "company already exists, input one that doesn't"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const createCompany = await Auth.create([{companyName, password:hashPassword, logo, companyMail,  companyAddress, productDescription}], {session});

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
        message: "company created successfully"
    });
};