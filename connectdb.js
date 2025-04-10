import mongoose from "mongoose";

const db = async () => {
    try {
        await mongoose.connect("mongodb+srv://ompalsingh79832:HFrKXMR4HWgZ4b6I@cluster0.ec8kn.mongodb.net/mydatabase");
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed");
    }
}

export default db;