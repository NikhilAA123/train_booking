import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js"; 
import jwt from "jsonwebtoken";

const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nikhil_pantham';
// Signup route
authRouter.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    
    if (fullName.length < 3 || fullName.length > 26) {
      return res.status(400).json({
        status: "info",
        message: "Length for full name should be between 3-26",
      });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "info",
        message: "Invalid email format",
      });
    }
   
    const passwordRegex =
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "info",
        message:
          "Password must be between 8-10 characters, including at least one uppercase, lowercase, number, and special character",
      });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "info", message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// Login route
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );


    const userData = {
      id: user.id, 
      fullName: user.fullName,
      email: user.email,
    };

    res
      .status(200)
      .json({ status: "success", message: "Login successful", user: userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

export default authRouter;
