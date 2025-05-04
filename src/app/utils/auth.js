import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "thisisverystrongpassword";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
  // const userId = user._id.toString();

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      class: user.class,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "30d",
    }
  );
};

export const verifyToken = async (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error("Failed to verify token", error);
  }
};
