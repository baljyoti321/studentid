import mongooseConnect from "@/app/utils/dbconnect";
import { hashPassword } from "@/app/utils/auth";
import { NextResponse } from "next/server";
import Admin from "@/models/admin_model";

export async function POST(req) {
  mongooseConnect();

  const { email, password } = await req.json();
  const hashedPassword = await hashPassword(password);

  const existingUser = await Admin.findOne({ email });
  if (existingUser)
    return NextResponse.json({ message: "User already exists", status: 409 });

  const newAdmin = new Admin({
    email,
    password: hashedPassword,
  });

  await newAdmin.save();
  return NextResponse.json({
    message: "Admin created successfully",
    status: 201,
  });
}
