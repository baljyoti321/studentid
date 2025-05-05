import mongooseConnect from "@/app/utils/dbconnect";
import { NextResponse } from "next/server";
import Student from "@/models/student_model";

export async function GET(req) {
  mongooseConnect();
  try {
    
    const data = await Student.find({});
    
    return NextResponse.json({ data, status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
