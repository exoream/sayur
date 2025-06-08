const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;


function createToken(id, role) {
  return jwt.sign(
    { id, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, // 1 hari
    secretKey,
    { algorithm: "HS256" }
  );
}

function extraToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded Token:", decoded);
    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function jwtMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "false", message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("JWT Verification Error:", err.message);
      return res.status(401).json({ status: "false", message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = { createToken, extraToken, jwtMiddleware };
