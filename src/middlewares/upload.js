const path = require('path')
const multer = require('multer')

const uploadProfile = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            cb(null, "./public/img/users")
        },
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    filename: (req, file, cb) => {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: { fileSize: 1 * 1024 * 524 } //1,5mb
}).single('image')

const uploadVehicle = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            cb(null, "./public/img/vehicles")
        },
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    filename: (req, file, cb) => {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: { fileSize: 1 * 1024 * 524 } //1,5mb
}).single('image')

module.exports = { uploadProfile, uploadVehicle }