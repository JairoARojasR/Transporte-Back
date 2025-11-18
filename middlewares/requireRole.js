export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.rol;

    if (!userRole) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Acceso denegado. Rol no autorizado." });
    }

    next();
  };
};
