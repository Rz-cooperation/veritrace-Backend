import ActivityLogs from "../models/activityLogs.model.js";
import Blacklist from "../models/blacklist.model.js";
import FlourBatch from "../models/flourBatch.model.js";
import ProductionBatch from "../models/productionBatch.model.js";
import Scan from "../models/qrScan.model.js";
import FraudAlert from "../models/fraudAlert.model.js"


//helper function to log activities, LogActivity

export const logActivity = async (companyId, action, details = {}) => {
    try {
        await ActivityLogs.create({
            companyId,
            action,
            details,
        });
        console.log(`[LOG] Action recorded: ${action}`);
    } catch (error) {
        console.log("Failed to save activity log: ", error.message);
    }
};


export const getActivityLogs = async (req, res) => {
    const companyId = req.auth.companyId;

    //Get the filter from the URL (i.e ?filter=create)
    const { filter } = req.query;

    //Building the database query
    const dbQuery = { companyId };

    //Apply the filter logic if a specific type is selected

    if (filter && filter !== "All Actions") {
        const filterType = filter.toLowerCase();

        if (filterType === "create") {
            // Matches "CREATED_FLOUR_BATCH", "GENERATED_QR", "CREATED_PRODUCTION_BATCH"
            dbQuery.action = { $regex: /CREATE|GENERATE/i };
        } else if (filterType === "update") {
            // Matches "UPDATED_PROFILE", "UPDATED_BATCH"
            dbQuery.action = { $regex: /UPDATE/i };
        } else if (filterType === "delete") {
            // Matches "DELETED_ACCOUNT"
            dbQuery.action = { $regex: /DELETE/i };
        }
    }

    const logs = await ActivityLogs.find(dbQuery)
        .sort({ createdAt: -1 }) //Newest first
        .limit(50);

    return res.status(200).json({
        message: "Activity logs retrieved",
        data: logs
    })

}

export const logout = async (req, res) => {
    try {
        //Get the token from the header
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(200).json({ message: "Logged out successfully" });

        const token = authHeader.split(" ")[1];

        // Add it to the Blacklist
        // We use .create() or .findOneAndUpdate() to avoid errors if they double-click logout
        await Blacklist.create({ token });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        // Even if it fails (e.g. duplicate key), we usually just tell the user "OK" to clear their session
        return res.status(200).json({ message: "Logged out successfully" });
    }
};

//For deleteinf flourbatch
export const deleteFlourBatch = async (req, res) => {
    const { id } =  req.params;
    const companyId = req.auth.companyId;

    //This checks if the batch exists and belongs to this company.
    const batch = await FlourBatch.findOne({_id: id, companyId: companyId});

    if(!batch){
        return res.status(404).json({message: "Flour batch not found"});
    }
    //This checks if this flour has been used in any production batch.
    const isUsedInProduction = await ProductionBatch.exists({ flourBatchId: id});

    if(isUsedInProduction) {
        return res.status(400).json({message: "Cannot delete: This flour batch has been used in production."})

    }
    
    //Delete
    await batch.deleteOne();

    //Log it
    await logActivity(companyId, "DELETED_FLOUR_BATCH", `Deleted flour batch ${batch.batchNumber}`);

    return res.status(200).json({message: "Flour batch deleted succesfully"});
}


//for deleting production batch
export const deleteProductionBatch = async (req, res) => {
    const { id } = req.params;
    const companyId = req.auth.companyId;


    //Finding the batch
    const batch = await ProductionBatch.findOne({_id: id, companyId});

    if(!batch){
        return res.status(404).json({message: "Batch not found "});
    }
    //Checks if the batch has been scanned.
    const hasScans = await Scan.exists({ batchId: id });
    if(hasScans){
        return res.status(400).json({
            message: "Cannot detele: This batch has already been scanned by customers. Deleting it will invalidate thier QR codes."
        });
    }
    //Delete
    await batch.deleteOne();

    //Log it
    await logActivity(companyId, "DELETED_PRODUCTION_BATCH", `Deleted production batch ${batch.batchNumber}`);

    return res.status(200).json({message: "Production batch deleted successfullly"});

}


//deleting fruadAlert...
export const deleteFraudAlert = async (req, res) => {
    const { id } = req.params;
    const companyId = req.auth.companyId;

    const alert = await FraudAlert.findOneAndDelete({_id: id, companyId});

    if(!alert){
        return res.status(404).json({message: "Alert not found"});
    }

    await logActivity(companyId, "DELETED_ALERT", "Removed a fraud alert from the dashboard");

    return res.status(200).json({message: "Alert removed"});
}


