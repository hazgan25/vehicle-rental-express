const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/img");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
});



const multerOptions = { storage };
const upload = multer({
    multerOptions, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false); return cb(new Error("Just JPG, PNG, JPEG formated"))
        }
    },
    limits: { filesSize: 1 * 1024 * 524 } //1,5mb
}).single("image");

module.exports = upload;