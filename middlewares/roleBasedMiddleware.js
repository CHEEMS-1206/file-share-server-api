export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !allowedRoles.includes(user.user_type)) {
        return res.status(403).json({
          success: false,
          msg: "Access denied for this role.",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      return res.status(500).json({
        success: false,
        msg: "Authorization error.",
      });
    }
  };
};
