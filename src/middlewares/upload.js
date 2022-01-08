const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/img");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
});


const upload = multer({
    storage, fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: { fileSize: 1 * 1024 * 524 } //1,5mb
}).single("image");


module.exports = upload;