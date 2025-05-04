import mongooseConnect from "@/app/utils/dbconnect";
import { verifyPassword, generateToken } from "../../../utils/auth";
import { NextResponse } from "next/server";
import Admin from "@/models/admin_model";
import Teacher from "@/models/teacher_model";

export async function POST(req) {
  try {
    mongooseConnect();

    const { email, password, role } = await req.json();

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ email });
      if (!teacher || !(await verifyPassword(password, teacher.password))) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = generateToken(teacher);
      const response = NextResponse.json({ message: "Login successful" });
      response.cookies.set("token", token, { maxAge: 30 * 24 * 60 * 60 });

      return response;
    } else {
      const admin = await Admin.findOne({ email });

      if (!admin || !(await verifyPassword(password, admin.password))) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = generateToken(admin);
      const response = NextResponse.json({ message: "Login successful" });
      response.cookies.set("token", token, { maxAge: 30 * 24 * 60 * 60 });

      return response;
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server error" },
      { status: 500 }
    );
  }
}
