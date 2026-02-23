import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database Connected Successfully');
        });

        const uri = process.env.MONGODB_URI.endsWith('/') ? process.env.MONGODB_URI.slice(0, -1) : process.env.MONGODB_URI;
        await mongoose.connect(`${uri}/BrightPath`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
