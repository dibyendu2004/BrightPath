import { clerkClient } from "@clerk/clerk-sdk-node";

// Middleware to protect routes and get user details
export const protectUser = async (req, res, next) => {
    try {
        const userId = req.headers.userid;
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        req.auth = { userId };
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Middleware to protect educator routes
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.headers.userid;
        // In a real scenario, check if the user has an educator role in Clerk or DB
        // For now, we assume the frontend sends the user identity
        if (!userId) {
             return res.json({ success: false, message: "Not Authorized" });
        }
        // You could add logic here to check if the user is an educator in your DB
        req.auth = { userId };
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
