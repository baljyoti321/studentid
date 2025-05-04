import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    class: {
      type: String,
      enum: [
        "PG",
        "Nursery",
        "LKG",
        "UKG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ],
      required: true,
    },
    rollNo: {
      type: Number,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      enum: ["EVEN", "ODD", "NM"],
      required: true,
    },
    house: {
      type: String,
      enum: ["red", "blue", "green", "yellow"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },
    photoLink: {
      type: String,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
