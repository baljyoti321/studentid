import mongooseConnect from "@/app/utils/dbconnect";
import { NextResponse } from "next/server";
import { authenticateToken } from "../../userMiddleware";
import Student from "@/models/student_model";

export async function GET(req) {
  mongooseConnect();
  try {
    const decodedToken = await authenticateToken(req);
    
    
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }

    const data = await Student.find({ created_by: decodedToken.id });
    
    return NextResponse.json({ data, status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
