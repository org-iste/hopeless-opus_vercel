// controllers/userController.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { validateRequestBody } from "../utils/validators.js";

// ---------------- Helper: Generate JWT ----------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------- Register User ----------------
export const registerUser = async (req, res) => {
  try {
    const { teamId, teamLeader, player2, password, role } = req.body;

    // Always validate leader
    // (you can uncomment your validateRequestBody for leader if you want)
    if (!teamId || !teamLeader || !password) {
      return res.status(400).json({ message: "Team ID, leader, and password are required" });
    }

    // If player2 exists and has meaningful data, validate it
    let finalPlayer2 = undefined;
    if (player2 && Object.values(player2).some((v) => v && v !== "")) {
      const player2Check = validateRequestBody(player2, ["name", "email"]);
      if (!player2Check.isValid) {
        return res.status(400).json({ message: `Player2: ${player2Check.message}` });
      }
      finalPlayer2 = player2;
    }

    // Check if email already exists (either leader or player2)
    const existingUser = await User.findOne({
      $or: [
        { "teamLeader.email": teamLeader.email },
        finalPlayer2?.email ? { "player2.email": finalPlayer2.email } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Build user object only with player2 if valid
    const newUserData = {
      teamId,
      teamLeader,
      password,
      role: role || 2001,
    };
    if (finalPlayer2) {
      newUserData.player2 = finalPlayer2;
    }

    const newUser = new User(newUserData);

    const token = generateToken(newUser);
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------- Login User ----------------http:localhost:5000/api/users/login
export const loginUser = async (req, res) => {
  try {
    const check = validateRequestBody(req.body, ["email", "password"]);
    if (!check.isValid) return res.status(400).json({ message: check.message });

    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({
      $or: [{ "teamLeader.email": email }, { "player2.email": email }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get All Users ----------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0)
      return res.status(404).json({ message: "No users found" });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get Single User ----------------
export const getUserById = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    // If player2 is being updated, validate fields
    if (req.body.player2) {
      const player2Check = validateRequestBody(req.body.player2, ["name", "email"]);
      if (!player2Check.isValid)
        return res.status(400).json({ message: `Player2: ${player2Check.message}` });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Delete User ----------------
export const deleteUser = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
