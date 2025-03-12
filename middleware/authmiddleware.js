const { verifyToken } = require("../config/jwt");

const authMiddleware = (role) => (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== role) {
      return res.status(403).json({ message: "Accès refusé. Rôle invalide." });
    }
    req.user = decoded; // Ajouter les informations de l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(400).json({ message: "Token invalide." });
  }
};

module.exports = authMiddleware;