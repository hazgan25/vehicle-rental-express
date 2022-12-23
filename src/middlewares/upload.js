const path = require("path");
const multer = require("multer");

const uploadProfile = multer({
  storage: multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, "./public/img/users");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 1 * 1024 * 1724 }, //1,7mb
}).single("image");

const uploadVehicle = multer({
  storage: multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, "./public/img/vehicles");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 1 * 1024 * 1724 }, //1,7mb
}).array("images", 3);

module.exports = { uploadProfile, uploadVehicle };
