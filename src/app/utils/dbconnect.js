import mongoose from "mongoose";
const dbUrl =
  process.env.MONGODB_URL ||
  "mongodb+srv://baljyoti500:baljyoti500@baljyoti.lu69tvc.mongodb.net/";
export default function mongooseConnect() {
  if (!dbUrl) {
    console.log("Databse is not connected!!!");
    return;
  }

  mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("Error connecting to the database:", err);
    });
}
