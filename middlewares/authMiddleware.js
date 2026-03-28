import { validateToken } from "../controllers/auth/auth.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const vldnRslt = await validateToken(req);

    if (vldnRslt.isInvalid) {
      return res
        .status(vldnRslt.status)
        .json({ success: false, msg: vldnRslt.message });
    }

    // Attach user data to request
    req.user = vldnRslt.decodedVals;

    next(); // go to next middleware/controller
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Authentication failed.",
    });
  }
};
