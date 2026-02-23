import { Webhook } from "svix";
import User from "../models/User.js";

// Clerk Webhook Table to sync clerk user data
export const clerkWebhooks = async (req, res) => {
    try {
        const whSecret = process.env.CLERK_WEBHOOK_SECRET;
        const svix_id = req.headers["svix-id"];
        const svix_timestamp = req.headers["svix-timestamp"];
        const svix_signature = req.headers["svix-signature"];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ success: false, message: "Missing Svix Headers" });
        }

        const payloadString = JSON.stringify(req.body);
        const wh = new Webhook(whSecret);
        let evt;

        try {
            evt = wh.verify(payloadString, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.log('Error verifying webhook:', err.message);
            return res.status(400).json({ success: false, message: "Webhook Verification Failed" });
        }

        const { data, type } = evt;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                await User.create(userData);
                res.json({ success: true, message: "User Created" });
                break;
            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({ success: true, message: "User Updated" });
                break;
            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                res.json({ success: true, message: "User Deleted" });
                break;
            }
            default:
                res.json({ success: true });
                break;
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
