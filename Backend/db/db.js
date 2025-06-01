import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

function connect() {
  console.log("Effective MONGO_URI:", process.env.MONGO_URI); // Added this line
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
}
export default connect;
