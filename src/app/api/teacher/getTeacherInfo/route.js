import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET || "thisisverystrongpassword";

export async function POST(req) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    return NextResponse.json({ userInfo: decodedToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
