import Scan from "../models/qrScan.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import FlourBatch from "../models/flourBatch.model.js";




export const getDashboardStats = async (req, res) => {
    const companyId = req.auth._id;

    const [flourBatchCount, productionBatchcount, totalScans] = await Promise.all([
        FlourBatch.countDocuments({ createdBy: companyId}),
        ProductionBatch.countDocuments({createdBy: companyId}),
        Scan.countDocuments({companyId: companyId})
    ]);

    return res.status(200).json({
        success:true,
        message: "Dashboard stats fetched successfuly",
        data: {
            flourBatches: flourBatchCount,
            productionBatches: productionBatchcount,
            totalScans: totalScans
        }
    });
}
