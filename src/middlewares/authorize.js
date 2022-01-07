const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
    const token = req.header("x-access-token");
    const jwtOptions = {
        issuer: process.env.ISSUER,
    };
    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
        if (err) return res.status(403).json({ err });
        req.userInfo = payload;
        next();
    });
};

const checkAdmin = (req, res, next) => {
    const { roles_id } = req.userInfo;
    if (roles_id !== 1) return res.status(401).json({ msg: "Akses Hanya Admin" });
    next();
}

const checkTenant = (req, res, next) => {
    const { roles_id } = req.userInfo;
    if (roles_id !== 3) return res.status(401).json({ msg: "Harus Menjadi Penyewa Dahulu" });
    next();
}

const checkUser = (req, res, next) => {
    const { roles_id } = req.userInfo;
    if (roles_id !== 2) return res.status(401).json({ msg: "Error Data" });
    next();
}

const logout = (req, res) => {
    let refreshToken = refreshToken.filter(token => token !== req.body.token);
    res.status(204).json({ msg: "Anda Berhasil Logout" });
}

module.exports = {
    checkToken,
    checkAdmin,
    checkTenant,
    checkUser,
    logout
};