import Scan from "../models/qrScan.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import FlourBatch from "../models/flourBatch.model.js";
import {transactionWrapper} from "../utils/transactionWrapper.js"

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
            flourType: theFlourBatchInfo.flourType,
            supplier: theFlourBatchInfo.supplier,
            batchNumber: theFlourBatchInfo.batchNumber,
            date: theFlourBatchInfo.dateReceived
    }))
    return res.status(200).json({success: true, message: "flour batch gotten succesfully", data: allFlourBatches});
}



export const createProductionBatch = async(req, res) => {

    await transactionWrapper(async(session) => {
        
        
        const { flourBatchId, bakingTime, ovenTemp, batchNumber} = req.body;

        if(!flourBatchId || !bakingTime || !ovenTemp || !batchNumber){
            return res.status(401).json({message: "Please fill all fields"});
        }

        const companyId = req.auth.companyId;

        if(batchNumber){
            return res.status(400).json({message: "Batch number already exists"});
        }

        const theProductionBatch = await ProductionBatch.create([{
            companyId: companyId,
            flourBatchId: flourBatchId,
            bakingTime: bakingTime,
            ovenTemp: ovenTemp,
            batchNumber: batchNumber
        }], {session});

        return res.status(201).json({message: "production batch created successfully", data: theProductionBatch});
    })
}

export const getProductionBatches = async(req, res) => {
    const companyId = req.auth.companyId;

    const productionBatches = await ProductionBatch.find({companyId: companyId}).populate("flourBatchId", "batchNumber supplier flourType")

    const allProductionBatches = productionBatches.map((theProductionBatchInfo) => ({
        flourBatchId: theProductionBatchInfo.flourBatchId,
        bakingTime: theProductionBatchInfo.bakingTime,
        ovenTemp: theProductionBatchInfo.ovenTemp,
        batchNumber: theProductionBatchInfo.batchNumber
    }));

    return res.status(200).json({message: "Production batches retrieved", data: allProductionBatches});
}

export const generateQR = async(req, res) => {

}

export const incrementScanCount = async(req, res) => {

}

export const getScanStats = async(req, res) => {

}

export const getFraudAlerts = async(req, res) => {

}

export const getActivityLogs = async(req, res) => {

}

