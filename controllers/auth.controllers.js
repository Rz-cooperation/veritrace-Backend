import Auth from "../models/auth.model.js";
import bcrypt, { hashSync } from "bcrypt";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { transactionWrapper } from "../utils/transactionWrapper.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import ActivityLogs from "../models/activityLogs.model.js";
import FlourBatch from "../models/flourBatch.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import FraudAlert from "../models/fraudAlert.model.js"

export const SignUp = async (req, res) => {
    await transactionWrapper(async (session) => {
        const {
            companyName,
            password,
            companyMail,
            streetNo,
            addressStr,
            state,
            country,
            postalCode,
            productDescription,
        } = req.body;

        if (
            !companyName ||
            !password ||
            !companyMail ||
            !streetNo ||
            !addressStr ||
            !state ||
            !country ||
            !postalCode ||
            !productDescription
        ) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const company = await Auth.findOne({ companyMail }).session(session);

        if (company) {
            return res
                .status(400)
                .json({ message: "company already exists, input one that doesn't" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const companyAddress = {
            streetNo,
            addressStr,
            state,
            country,
            postalCode,
            location: {
                type: "Point",
                coordinates: [0, 0]
            }
        }

        let newCompanyData = {
            companyName,
            password: hashPassword,
            companyMail,
            companyAddress: companyAddress,
            productDescription,
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);

            newCompanyData.logo = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        const createCompany = await Auth.create([newCompanyData], { session });

        return res.status(201).json({
            message: "company created successfully",
            company: createCompany[0],
        });
    });
};

export const signIn = async (req, res) => {
    await transactionWrapper(async (session) => {
        const { companyMail, password } = req.body;

        if (!companyMail || !password) {
            return res.status(400).json({ message: "Email & Password required" });
        }

        const company = await Auth.findOne({ companyMail });

        if (!company) {
            return res.status(400).json({ message: "Company does not exist" });
        }

        const match = await bcrypt.compare(password, company.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid Email or Password!" });
        }
        const token = jwt.sign(
            { companyId: company._id, companyName: company.companyName },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const getFullAddress = () => {
            const addr = company.companyAddress;
            if (!addr) return "No address provided";
            return [addr.streetNo, addr.addressStr, addr.state, addr.country]
                .filter(Boolean)
                .join(", ");
        };
        return res.status(200).json({
            success: true,
            message: "login successful",
            token: token,
            company: {
                _id: company._id,
                name: company.companyName,
                mail: company.companyMail,
                address: getFullAddress(),
                description: company.productDescription,
                logo: company.logo.url,
            },
        });
    });
};

export const deleteAccount = async (req, res) => {
    const companyId = req.auth.companyId;

    //Delete all related data first
    await FlourBatch.deleteMany({company: companyId});
    await ProductionBatch.deleteMany({companyId: companyId});
    await ActivityLogs.deleteMany({companyId: companyId});
    await FraudAlert.deleteMany({companyId: companyId});

    //Keeping QRScans for analytics.

    await Auth.findByIdAndDelete(companyId);

    return res.status(200).json({message: "Account and all data permanently deleted."})
}
