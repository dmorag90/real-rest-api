const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied, no token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtKey")); //config.get brings the private key from the configuration file placed under /config folder
    req.user = decoded;
    next(); //מאפשר מעבר לאחר בדיקת הטוקן
  } catch (err) {
    res.status(400).send("Access denied, invalid token");
  }
};
