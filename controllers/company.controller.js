import Scan from "../models/qrScan.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import FlourBatch from "../models/flourBatch.model.js";
import {transactionWrapper} from "../utils/transactionWrapper.js"
import QRCode from "qrcode"
import { populate } from "dotenv";

export const getDashboardStats = async (req, res) => {
    const companyId = req.auth._id;

    const [flourBatchCount, productionBatchcount, totalScans] = await Promise.all(
        [
            FlourBatch.countDocuments({ createdBy: companyId }),
            ProductionBatch.countDocuments({ createdBy: companyId }),
            Scan.countDocuments({ companyId: companyId }),
        ]
    );

    return res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfuly",
        data: {
            flourBatches: flourBatchCount,
            productionBatches: productionBatchcount,
            totalScans: totalScans,
        },
    });
};


//creating the flouer batch it takes flourType, supplier, batchnumber
export const createFlourBatch = async (req, res) => {
    await transactionWrapper(async (session) => {

        // console.log("Token Payload:", req.auth); 

        const companyId = req.auth.companyId; 

        const {flourType, supplier, batchNumber} = req.body;

        if (!flourType || !supplier || !batchNumber) {
            return res.status(400).json({ message: "All information required" });
        }

        const theFlourBatch = await FlourBatch.create([{
            companyId,
            flourType,
            supplier,
            batchNumber
        }], {session});

        return res
            .status(201)
            .json({success: true, message: "Flour Batch created successfully", data: theFlourBatch });
    });
};

//getting flour batches for each company
export const getFlourBatches = async (req, res) => {
    const companyId = req.auth.companyId;

    const batches = await FlourBatch.find({companyId: companyId});

    const allFlourBatches = batches.map((theFlourBatchInfo) => ({
            id: theFlourBatchInfo._id,
            flourType: theFlourBatchInfo.flourType,
            supplier: theFlourBatchInfo.supplier,
            batchNumber: theFlourBatchInfo.batchNumber,
            date: theFlourBatchInfo.dateReceived
    }))
    return res.status(200).json({success: true, message: "flour batch gotten succesfully", data: allFlourBatches});
}

//The idea is the date, will always be today's date, that cannot change only the time.


//Helper function that combines today with the time string...
const createTimeDate = (time) => {
    if(!time) return null;
    const today = new Date();
    const [hours, minutes] = time.split(':'); //splites 01:19 into [01: 19] for user input.
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0); //This sets the time on today's date, "parseInt" is so it can be inputed as an integer...
    return today;
}




export const createProductionBatch = async(req, res) => {

    await transactionWrapper(async(session) => {
        
        
        const { flourBatchId, bakingStartTime, bakingEndTime, ovenTemp, batchNumber, quantityProduced} = req.body;

        if(!flourBatchId || !bakingStartTime || !bakingEndTime|| !ovenTemp || !batchNumber ||!quantityProduced){
            return res.status(401).json({message: "Please fill all fields"});
        }

        const companyId = req.auth.companyId;

        const startTime = createTimeDate(bakingStartTime);
        const endTime = createTimeDate(bakingEndTime);

        if(!startTime || !endTime){
            return res.status(400).json({message: "Please provide vaild start and end times (HH:MM)"});
        }

        const theProductionBatch = await ProductionBatch.create([{
            companyId: companyId,
            flourBatchId: flourBatchId,
            bakingStartTime: startTime,
            bakingEndTime: endTime,
            ovenTemp: ovenTemp,
            batchNumber: batchNumber,
            quantityProduced: quantityProduced || 1
        }], {session});

        return res.status(201).json({message: "production batch created successfully", data: theProductionBatch});
    });
}

export const getProductionBatches = async(req, res) => {
    const companyId = req.auth.companyId;

    const productionBatches = await ProductionBatch.find({companyId: companyId}).populate("flourBatchId", "batchNumber supplier flourType")

    const allProductionBatches = productionBatches.map((theProductionBatchInfo) => ({
        id: theProductionBatchInfo._id,
        flourBatchId: theProductionBatchInfo.flourBatchId,
        bakingStartTime: theProductionBatchInfo.bakingStartTime,
        bakingEndTime: theProductionBatchInfo.bakingEndTime,
        ovenTemp: theProductionBatchInfo.ovenTemp,
        batchNumber: theProductionBatchInfo.batchNumber
    }));

    return res.status(200).json({message: "Production batches retrieved", data: allProductionBatches});
}

export const generateQR = async(req, res) => {
    await transactionWrapper(async(session) => {
        const {id} = req.params;

        // Find the production batch 
        const batch = await ProductionBatch.findById(id).populate("flourBatchId").session(session);

        if(!batch){
            return res.status(404).json({message: "Batch not found"});
        }

        const batchNo = batch.batchNumber;
        // const time = batch.

        //Build QR Payload...
        const qrPayload = JSON.stringify({
            batchId: batch._id,
            flourBatchId: batch.flourBatchId,
            timestamp: batch.createdAt,
            companyId: batch.company
        });

        //Generate QR BAse64 Data URL, this creates a string starting with "data:image/png;base64...."
        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

        //Save QR link to ProductionBatch
        batch.qrCode = qrCodeDataUrl;
        await batch.save();

        //Return QR to frontend here
        return res.status(200).json({
            message: "QR Code generated successfully",
            qrCode: qrCodeDataUrl, //Frontend can put this directly into <img src={qrCode} />
            batchId: batch._id
        });
    })
}

export const incrementScanCount = async(req, res) => {

}

export const getScanStats = async(req, res) => {

}

export const getFraudAlerts = async(req, res) => {

}

export const getActivityLogs = async(req, res) => {

}

