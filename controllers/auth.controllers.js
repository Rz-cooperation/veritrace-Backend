import Auth from "../models/auth.model.js";
import bcrypt, { hashSync } from "bcrypt";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import { transactionWrapper } from "../utils/transactionWrapper.js";
import { getCoordinatesFromAddress } from "../utils/geocoder.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";




export const SignUp = async (req, res) => {
    await transactionWrapper(async (session) => {
        const {
            companyName,
            password,
            companyMail,
            companyAddress,
            productDescription,
        } = req.body;


        if (
            !companyName ||
            !password ||
            !companyMail ||
            !companyAddress ||
            !productDescription
        ) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (!companyAddress.addressStr || !companyAddress.country) {
            return res.status(400).json({ message: "Incomplete address provided." });
        }

        const company = await Auth.findOne({ companyMail }).session(session);

        if (company) {
            return res
                .status(400)
                .json({ message: "company already exists, input one that doesn't" });
        }

        //checks if the frontend sets the coordinates, if not it generates them
        if (!companyAddress.location || !companyAddress.location.coordinates) {
            try {
                //this calls the utility function
                const locationPoint = await getCoordinatesFromAddress(companyAddress);
                //Attaches the result to the address object
                companyAddress.location = locationPoint;
            } catch (geoError) {
                return res.status(400).json({ message: geoError.message || "Invalid Address" })
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        let newCompanyData = {
            companyName,
            password: hashPassword,
            companyMail,
            companyAddress,
            productDescription
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);

            newCompanyData.logo = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        const createCompany = await Auth.create(
            [
                newCompanyData
            ],
            { session }
        );

        return res.status(201).json({
            message: "company created successfully",
            company: createCompany[0]
        });
    });
};

export const signIn = async(req, res) => {
    await transactionWrapper(async (session) => {
        const {companyMail, password} = req.body;

        if(!companyMail || !password){
            return res.status(400).json({message: "Email & Password required"});
        }

        const company = await Auth.findOne({companyMail});

        if(!company){
            return res.status(400).json({message: "Company already exists"});
        }

        const match = bcrypt.compare(password, company.password);
        if(!match){
            return res.status(400).json({message: "Incorrect password, put in the correct password!"})
        }

        const token = jwt.sign({companyId: company._id, compsnyName: company.companyName}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        return res.status(200).json({message: "login successful", token: token});

    });
}
