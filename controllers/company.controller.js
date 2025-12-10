import Scan from "../models/qrScan.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import FlourBatch from "../models/flourBatch.model.js";
import { transactionWrapper } from "../utils/transactionWrapper.js"
import FraudAlert from "../models/fraudAlert.model.js";
import { logActivity } from "./activity.controller.js";
import QRCode from "qrcode"


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

        const { flourType, supplier, batchNumber } = req.body;

        if (!flourType || !supplier || !batchNumber) {
            return res.status(400).json({ message: "All information required" });
        }

        const theFlourBatch = await FlourBatch.create([{
            companyId,
            flourType,
            supplier,
            batchNumber
        }], { session });

        await logActivity(
            req.auth.companyId,
            "CREATED_FLOUR_BATCH",
            `Added flour batch:  ${theFlourBatch.batchNumber}`
        )

        return res
            .status(201)
            .json({ success: true, message: "Flour Batch created successfully", data: theFlourBatch });
    });
};

//getting flour batches for each company
export const getFlourBatches = async (req, res) => {
    const companyId = req.auth.companyId;

    const batches = await FlourBatch.find({ companyId: companyId });

    const allFlourBatches = batches.map((theFlourBatchInfo) => ({
        id: theFlourBatchInfo._id,
        flourType: theFlourBatchInfo.flourType,
        supplier: theFlourBatchInfo.supplier,
        batchNumber: theFlourBatchInfo.batchNumber,
        date: theFlourBatchInfo.dateReceived
    }))
    return res.status(200).json({ success: true, message: "flour batch gotten succesfully", data: allFlourBatches });
}

//The idea is the date, will always be today's date, that cannot change only the time.


//Helper function that combines today with the time string...
const createTimeDate = (time) => {
    if (!time) return null;
    const today = new Date();
    const [hours, minutes] = time.split(':'); //splites 01:19 into [01: 19] for user input.
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0); //This sets the time on today's date, "parseInt" is so it can be inputed as an integer...
    return today;
}




export const createProductionBatch = async (req, res) => {

    await transactionWrapper(async (session) => {


        const { flourBatchId, bakingStartTime, bakingEndTime, ovenTemp, batchNumber, quantityProduced } = req.body;

        if (!flourBatchId || !bakingStartTime || !bakingEndTime || !ovenTemp || !batchNumber || !quantityProduced) {
            return res.status(401).json({ message: "Please fill all fields" });
        }

        const companyId = req.auth.companyId;

        const startTime = createTimeDate(bakingStartTime);
        const endTime = createTimeDate(bakingEndTime);

        if (!startTime || !endTime) {
            return res.status(400).json({ message: "Please provide vaild start and end times (HH:MM)" });
        }

        const theProductionBatch = await ProductionBatch({
            companyId: companyId,
            flourBatchId: flourBatchId,
            bakingStartTime: startTime,
            bakingEndTime: endTime,
            ovenTemp: ovenTemp,
            batchNumber: batchNumber,
            quantityProduced: quantityProduced || 1
        });

        await theProductionBatch.save({ session });

        await logActivity(
            companyId,
            "CREATED_PRODUCTION_BATCH",
            `Started baking batch ${theProductionBatch.batchNumber}`,
            { quantity: theProductionBatch.quantityProduced, ovenTemp: theProductionBatch.ovenTemp }
        );

        try {// pass the *first* item since .create returns an array when used with []
            runFraudChecks(theProductionBatch, companyId, theProductionBatch._id);
        } catch (fraudError) {
            console.error("Fraud check failed (non-critical):", fraudError);
        }
        return res.status(201).json({ message: "production batch created successfully", data: theProductionBatch });
    });
}

export const getProductionBatches = async (req, res) => {
    const companyId = req.auth.companyId;

    const productionBatches = await ProductionBatch.find({ companyId: companyId }).populate("flourBatchId", "batchNumber supplier flourType")

    const allProductionBatches = productionBatches.map((theProductionBatchInfo) => ({
        id: theProductionBatchInfo._id,
        flourBatchId: theProductionBatchInfo.flourBatchId,
        bakingStartTime: theProductionBatchInfo.bakingStartTime,
        bakingEndTime: theProductionBatchInfo.bakingEndTime,
        ovenTemp: theProductionBatchInfo.ovenTemp,
        batchNumber: theProductionBatchInfo.batchNumber
    }));

    return res.status(200).json({ message: "Production batches retrieved", data: allProductionBatches });
}

export const generateQR = async (req, res) => {
    await transactionWrapper(async (session) => {
        const { id } = req.params;

        // Find the production batch 
        const batch = await ProductionBatch.findById(id).populate("flourBatchId").session(session);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        const batchNo = batch.batchNumber;
        const time = batch.bakingEndTime;

        const dateOptions = { weekday: 'long' };
        const day = new Date(batch.createdAt).toLocaleDateString('en-US', dateOptions);

        const supplier = batch.flourBatchId.supplier;
        const flourType = batch.flourBatchId.flourType;

        const qrPayload = `batchno: ${batchNo}, baked on ${day} at ${time} using ${supplier} ${flourType}`;

        // //Build QR Payload...
        // const qrPayload = JSON.stringify({
        //     batchId: batch._id,
        //     flourBatchId: batch.flourBatchId,
        //     timestamp: batch.createdAt,
        //     companyId: batch.company
        // });

        //Generate QR BAse64 Data URL, this creates a string starting with "data:image/png;base64...."
        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

        //Save QR link to ProductionBatch
        batch.qrCode = qrCodeDataUrl;
        await batch.save();

        logActivity(
            batch.company,
            "GENERATE_QR",
            `Generated QR code for batch ${batch.batchNumber}`
        );

        //Return QR to frontend here
        return res.status(200).json({
            message: "QR Code generated successfully",
            qrCode: qrCodeDataUrl, //Frontend can put this directly into <img src={qrCode} />
            batchId: batch._id
        });
    })
}

export const incrementScanCount = async (req, res) => {
    const { batchId } = req.params;
    const { location, deviceInfo } = req.body

    const batchExists = await ProductionBatch.findOne({ _id: batchId });
    if (!batchExists) {
        return res.status(404).json({ message: "Invalid QR Code" });
    }
    await Scan.create({
        batchId,
        location,
        deviceInfo
    });

    return res.status(200).json({ message: "Scan verified and recorded" });
}

export const getScanStats = async (req, res) => {
    const { batchId } = req.params;

    // Count total scans
    const totalScans = await Scan.countDocuments({ batchId });

    // Get the last 5 scans (to show recent activity)
    const recentScans = await Scan.find({ batchId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('location createdAt'); // Only get necessary fields

    return res.status(200).json({
        message: "Analytics retrieved",
        data: {
            batchId,
            totalScans,
            recentScans
        }
    });
}


export const getScanAnalytics = async (req, res) => {
    try {
        const companyId = req.auth.companyId;

        //Get Start of Today (for "Total Scans Today")
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Run the Aggregation
        // This looks complex, but it's just asking the DB to do the math for us
        const stats = await Scan.aggregate([
            // Step A: Find scans belonging to this company's batches
            // (We need to join with ProductionBatch first to filter by companyId)
            {
                $lookup: {
                    from: "productionbatches", // ensure this matches your collection name (usually lowercase plural)
                    localField: "batchId",
                    foreignField: "_id",
                    as: "batchDetails"
                }
            },
            { $unwind: "$batchDetails" }, // Unpack the array
            { $match: { "batchDetails.companyId": companyId } }, // Filter by logged-in company

            // Group by Batch to get table data
            {
                $group: {
                    _id: "$batchId",
                    batchNumber: { $first: "$batchDetails.batchNumber" },
                    totalScans: { $sum: 1 },
                    lastScan: { $max: "$createdAt" },
                    scansToday: {
                        $sum: {
                            $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0]
                        }
                    }
                }
            },

            // Sort by most scanned first
            { $sort: { totalScans: -1 } }
        ]);

        // Calculate Summary Cards from the result
        const totalScansAllTime = stats.reduce((acc, item) => acc + item.totalScans, 0);
        const totalScansToday = stats.reduce((acc, item) => acc + item.scansToday, 0);
        const uniqueBatches = stats.length;

        // Average Scans per Batch
        const avgScans = uniqueBatches > 0 ? Math.round(totalScansAllTime / uniqueBatches) : 0;

        // Most Scanned Batch
        const mostScanned = stats.length > 0 ? stats[0].batchNumber : "N/A";

        //Format the Table Data
        const tableData = stats.map(item => ({
            batchId: item.batchNumber, // The dashboard shows "PB-2001"
            totalScans: item.totalScans,
            lastScan: item.lastScan
        }));

        return res.status(200).json({
            message: "Analytics retrieved",
            data: {
                summary: {
                    totalScansToday,
                    mostScannedBatch: mostScanned,
                    avgScansPerBatch: avgScans
                },
                tableData
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return res.status(500).json({ message: "Error getting analytics", error: error.message });
    }
};

// --- HELPER: The Fraud Logic ---
// You call this inside your 'createProductionBatch' controller
export const runFraudChecks = async (batchData, companyId, batchId) => {
    const alerts = [];

    // Rule 2: Is baking time reasonable? (< 12 hours)
    // We calculate difference in milliseconds, then convert to hours
    const durationMs = new Date(batchData.bakingEndTime) - new Date(batchData.bakingStartTime);
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours > 12) {
        alerts.push({
            companyId,
            batchId,
            severity: "MEDIUM",
            message: `Unusual baking duration: ${durationHours.toFixed(1)} hours. Standard is < 12 hours.`
        });
    } else if (durationHours < 0) {
        alerts.push({
            companyId,
            batchId,
            severity: "HIGH",
            message: `Impossible time: Baking ended before it started.`
        });
    }

    // Rule 3: Oven temperature in range? (Standard bread: 180C - 260C)
    // We assume anything below 100C or above 300C is likely fake data
    const temp = batchData.ovenTemp;
    if (temp < 100 || temp > 300) {
        alerts.push({
            companyId,
            batchId,
            severity: "HIGH",
            message: `Extreme oven temperature detected: ${temp}°C.`
        });
    }

    // Save alerts to DB if any found
    if (alerts.length > 0) {
        await FraudAlert.insertMany(alerts);
        console.log(`Generated ${alerts.length} fraud alerts.`);
    }
};


export const getFraudAlerts = async (req, res) => {
    try {
        const companyId = req.auth.companyId;

        const alerts = await FraudAlert.find({ companyId })
            .sort({ createdAt: -1 }) // Newest first
            .populate("batchId", "batchNumber"); // Show which batch caused the alert

        return res.status(200).json({
            message: "Fraud alerts retrieved",
            data: alerts
        });

    } catch (error) {
        return res.status(500).json({ message: "Error getting alerts", error: error.message });
    }
};


export const getBatchQRCodes = async (req, res) => {
        const companyId = req.auth.companyId;

        // Fetch all batches for this company
        const qrList = await ProductionBatch.find({ companyId })
            // Select only the data needed for the QR Card/List
            .select("batchNumber qrCode createdAt bakingEndTime")
            .sort({ createdAt: -1 }); // Newest batches first

        return res.status(200).json({
            message: "QR Codes retrieved successfully",
            data: qrList
        });
};




