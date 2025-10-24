import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, rol, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};