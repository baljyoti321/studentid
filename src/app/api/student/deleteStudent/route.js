import mongooseConnect from "@/app/utils/dbconnect";
import { authenticateToken } from "../../userMiddleware";
import { NextResponse } from "next/server";
import Student from "@/models/student_model";

export async function DELETE(req) {
  mongooseConnect();
  const decodedToken = await authenticateToken(req);
  
  if (!decodedToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the student ID from the URL
    const url = new URL(req.url);
    const studentId = url.searchParams.get("id");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Find the student to delete
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if the user is authorized to delete this student (teacher or admin)
    // You can add more checks here if needed, such as only allowing deletion by the creator

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    return NextResponse.json(
      {
        message: "Student deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in student deletion:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 