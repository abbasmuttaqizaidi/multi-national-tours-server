// middleware/roleMiddleware.js
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};