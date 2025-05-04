import { verifyToken } from "@/app/utils/auth";
import { NextResponse } from "next/server";

export const authenticateToken = async (req) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 401 });
  }

  try {
    const decodedToken = await verifyToken(token);

    return decodedToken;
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
};

export const checkAdminRole = (decodedToken) => {
  if (decodedToken.role !== "admin") {
    return NextResponse.json({ message: "Forbidden", status: 403 });
  }
};
