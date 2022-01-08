const upload = require('../middlewares/upload');

const uploadHandler = (req, res, next) => {
    upload(req, res, (err) => {
        if (err && err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ msg: "Ukuran file melebihi batas" })
        } else if (err) {
            return res.status(401).json({ msg: "Just JPG, PNG, JPEG formated" })
        }
        next();
    })
}


module.exports = { uploadHandler };