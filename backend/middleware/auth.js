const { UserModel } = require("../model/UserModel");
const { verifyJwt } = require("../utils/security");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyJwt(token, JWT_SECRET);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      userId: String(user._id),
      email: user.email,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAuth };
