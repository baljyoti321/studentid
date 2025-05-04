import mongooseConnect from "@/app/utils/dbconnect";
import { authenticateToken, checkAdminRole } from "../../userMiddleware";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Student from "@/models/student_model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
  timeout: 60000 
});

export async function POST(req) {
  mongooseConnect();
  const decodedToken = await authenticateToken(req);
  if (!decodedToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("file");
    const clas = formData.get("clas");
    const rollNo = formData.get("rollNo");
    const section = formData.get("section");
    const house = formData.get("house");
    const address = formData.get("address");
    const contact = formData.get("contact");
    const fatherName = formData.get("fatherName");
    const motherName = formData.get("motherName");

    if (!file) {
      return NextResponse.json({ error: "file not found" }, { status: 400 });
    }

    // Process file upload with improved configuration
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

    // Check for existing student
    const existingStudent = await Student.findOne({
      class: clas,
      rollNo: Number(rollNo),
      section,
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: "Student already exists" },
        { status: 409 }
      );
    }

    // Create new student with created_by
    const newStudent = new Student({
      name,
      class: clas,
      rollNo: Number(rollNo), // Convert to number
      section,
      house,
      address,
      contact,
      fatherName,
      motherName,
      photoLink: photoUrl,
      created_by: decodedToken.id,
    });
    await newStudent.save();

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: newStudent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in student creation:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
