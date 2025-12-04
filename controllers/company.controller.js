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
            .json({ message: "Flour Batch created successfully", batch: theFlourBatch });
    });
};



