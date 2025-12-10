import ActivityLogs from "../models/activityLogs.model.js";
import Blacklist from "../models/blacklist.model.js";

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

