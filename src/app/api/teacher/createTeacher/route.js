import mongooseConnect from "@/app/utils/dbconnect";
import { authenticateToken, checkAdminRole } from "../../userMiddleware";
import { hashPassword } from "@/app/utils/auth";
import Teacher from "@/models/teacher_model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    mongooseConnect();

    const { email, name, password, clas } = await req.json();
    const hashedPassword = await hashPassword(password);

    const existingUser = await Teacher.findOne({ email });
    if (existingUser)
      return NextResponse.json({ message: "User already exists", status: 409 });

    const newTeacher = new Teacher({
      email,
      name,
      password: hashedPassword,
      class: clas,
    });

    await newTeacher.save();
    return NextResponse.json({
      message: "User created successfully",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
