import mongooseConnect from "@/app/utils/dbconnect";
import { authenticateToken } from "../../userMiddleware";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Student from "@/models/student_model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
  timeout: 60000 // Increase timeout to 60 seconds
});

export async function PUT(req) {
  mongooseConnect();
  const decodedToken = await authenticateToken(req);
  if (!decodedToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const studentId = formData.get("studentId");
    const name = formData.get("name");
    const clas = formData.get("clas");
    const rollNo = formData.get("rollNo");
    const section = formData.get("section");
    const house = formData.get("house");
    const address = formData.get("address");
    const contact = formData.get("contact");
    const fatherName = formData.get("fatherName");
    const motherName = formData.get("motherName");
    const file = formData.get("file");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Find the student to update
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update the student data
    const updateData = {
      name: name || student.name,
      class: clas || student.class,
      rollNo: rollNo ? Number(rollNo) : student.rollNo,
      section: section || student.section,
      house: house || student.house,
      address: address || student.address,
      contact: contact || student.contact,
      fatherName: fatherName || student.fatherName,
      motherName: motherName || student.motherName,
    };

    // Handle file upload if provided
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { 
            folder: "students",
            resource_type: "image",
            timeout: 60000, // Increase upload stream timeout
            transformation: [{ width: 500, height: 500, crop: "fill" }]
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        upload_stream.end(buffer);
      });

      // Use a simpler transformation approach
      const photoUrl = result.secure_url;
      updateData.photoLink = photoUrl;
    }

    // Update the student in the database
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Student updated successfully",
        student: updatedStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in student update:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 