import jwt from "jsonwebtoken";
import env from "../config/env.js";

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Authentication required",
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Invalid authorization format",
      });
    }

    // Get token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      env.JWT.SECRET
    );

    // Store authenticated user information
    req.user = decoded;

    // Continue to route
    next();

  } catch (error) {
    console.log("Authentication error:", error);

    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;