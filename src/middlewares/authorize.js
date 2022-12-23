const jwt = require("jsonwebtoken");
const db = require("../database/db");

const checkToken = (req, res, next) => {
  const token = req.header("x-access-token");
  const jwtOptions = { issuer: process.env.ISSUER };
  const sqlQuery = `SELECT token FROM blacklist_token WHERE token = ?`;

  db.query(sqlQuery, [token], (err, result) => {
    if (err) return res.status(500).json({ err });
    if (result.length > 0)
      return res.status(403).json({ message: "You need to login first" });

    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
      if (err) return res.status(403).json({ msg: "You need to login first" });
      req.userInfo = payload;
      next();
    });
  });
};

const checkAdmin = (req, res, next) => {
  const { roles_id } = req.userInfo;
  if (roles_id !== 1)
    return res.status(401).json({ msg: "Only Admin Access! (>_<)" });
  next();
};

const checkUser = (req, res, next) => {
  const { roles_id } = req.userInfo;
  if (roles_id !== 2)
    return res.status(401).json({ msg: "You are not an ordinary user! ('o')" });
  next();
};

const checkRenter = (req, res, next) => {
  const { roles_id } = req.userInfo;
  if (roles_id !== 3)
    return res.status(401).json({ msg: "Must Be a Renter First (-_-)" });
  next();
};

module.exports = {
  checkToken,
  checkAdmin,
  checkRenter,
  checkUser,
};
